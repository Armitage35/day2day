var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    User = require('./models/users.js'),
    userTasks = require('./models/tasks.js'),
    userNotes = require('./models/notes.js'),
    validator = require('validator'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    gravatar = require('gravatar'),
    compressor = require('node-minify'),
    upload = require('express-fileupload'),
    AWS = require('aws-sdk'),
    DOMAIN = 'mail.day2dayapp.net',
    mailGunApi_key = require('./keys/mailgunCred.js'),
    pocketConsumerKey = require('./keys/pocketConsumerKey.js'),
    mailgun = require('mailgun-js')({ apiKey: mailGunApi_key, domain: DOMAIN }),
    pug = require('pug'),
    request = require('request'),
    Analytics = require('analytics-node'),
    analytics = new Analytics('I2DPb8fIVfe65pnlBxXNQfkWND4mvtuA'),
    app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.urlencoded());
app.use(express.session({ secret: 'oiuerrweioiurew', /*resave: false, */ saveUninitialize: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(upload());

// Using Google Closure Compiler to minify the app.js file
// compressor.minify({
//     compressor: 'gcc',
//     input: 'client/app.js',
//     output: 'client/app-min.js',
//     callback: function(err, min) {}
// });

//connect mongoose to DB
mongoose.connect('mongodb://localhost/day2day');

var port = process.env.PORT || 80;
http.createServer(app).listen(port);
console.log("app working on port " + port);

//loading AWS config
AWS.config.loadFromPath('./keys/awsCredentials.json');

// Create an S3 client
var s3 = new AWS.S3();

// Send a log file to S3 when server started
var bucketName = 'day2dayapp.net';

//passort local strategy
passport.use(new LocalStrategy(
    function(email, password, done) {
        User.findOne({ email: email }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                console.log("No user match this email");
                return done(null, false, { message: 'Incorrect email.' });
            }
            console.log("Recieved password " + password);
            if (bcrypt.compareSync(password, user.password) === false) {
                console.log("Do passwords match: " + bcrypt.compareSync(password, user.password));
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

// sending to landing page
app.get('/landing', function(req, res) {
    res.redirect('landingPage/landing.html');
});

//user login
app.post('/login', function(req, res) {
    passport.authenticate('local', { session: true }, function(err, user, info) {
        if (err) { return err; }
        if (!user) { return res.send('not found'); }
        req.logIn(user, function(err) {
            return res.json(user._id);
        });
    })(req, res);


    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
});

//user registration handling
app.post('/user', function(req, res) {
    var tempID = req.body.tempUserid,
        username = req.body.username,
        email = req.body.email,
        password = req.body.password,
        avatar = gravatar.url(req.body.email, { protocol: 'https' }),
        passwordRepeat = req.body.passwordRepeat,
        hashedPassword = bcrypt.hashSync(password, 10); //hash password syncronously

    var newUser = new User({
        "tempID": tempID,
        "username": username,
        "email": email,
        "password": hashedPassword,
        "avatar": avatar,
        "settings": {
            "temperatureUnit": "celsius",
            "backgroundPicture": "nature"
        }
    });

    //making the promise
    var emailTakenPromise = User.findOne({ 'email': email }, function(err, User) {
        if (err) { console.log(err) }
        else if (User) {
            emailTakenPromise = User.email;
        }
    });

    //checking on our promise
    var emailTaken;
    emailTakenPromise.then(function() {
        emailTaken = email === emailTakenPromise;

        //making checks on user info
        var error = [];
        if (validator.isEmail(email) === false) {
            error.push('E1');
        }
        if (password != passwordRepeat) {
            error.push('E2');
        }
        if (password.length < 5) {
            error.push('E3');
        }
        if (emailTaken === true) {
            error.push('E4');
        }
        if (error.length > 0) {
            res.send(error);
        }
        else {
            newUser.save(function(err, result) {
                if (err !== null) {
                    console.log(err);
                    res.send("ERROR");
                }
                else {
                    createUser(newUser, res);
                }
            });
        }
        console.log(error);
    });
});

app.get('/user', function(req, res) {
    let userID = req.query.userID;

    User.findById(userID).exec(function(err, user) {
        if (err) {
            console.log("an error has occured");
        }
        else {
            res.json(user);
        }
    });
});

app.put('/user', function(req, res) {
    console.log(req.body);
    let updatedName = req.body.name,
        backgroundTheme = req.body.background,
        temperatureUnit = req.body.temperatureUnit,
        userID = req.body.userID,
        operationType = req.body.operationType;

    if (operationType == 'settingsEdit') {
        User.update({ _id: userID }, {
            username: updatedName,
            settings: {
                temperatureUnit: temperatureUnit,
                backgroundPicture: backgroundTheme
            }
        }, function(err, result) {
            if (err !== null) {
                console.log(err);
                res.send('ERROR');
            }
            else {
                console.log(result);
                res.send(result);
            }
        });
    }
    else if (operationType == 'removeIntegration') {
        User.update({ _id: userID }, {
            integrations: {
                pocket: {
                    connected: false,
                    token: ''
                }
            }
        }, function(err, result) {
            if (err !== null) {
                console.log(err);
                res.send('ERROR');
            }
            else {
                console.log(result);
                res.send(result);
            }
        });
    }
});

// new avatar acceptance


//tasks handling
app.post('/todos', function(req, res) {
    let newTask = new userTasks({
        'comment': req.body.userTasks.comment,
        'commentNb': req.body.userTasks.commentNb,
        'complete': req.body.userTasks.complete,
        'createdOn': req.body.userTasks.createdOn,
        'dueDate': req.body.userTasks.dueDate,
        'id': req.body.userTasks.id,
        'title': req.body.userTasks.title,
        'userid': req.body.userTasks.userID
    });

    newTask.save(function(err, result) {
        if (err !== null) {
            console.log(err);
            res.send("ERROR");
        }
        res.json(result);
    });
});

app.put('/todos/comment', function(req, res) {
    var taskID = req.body.id;

    userTasks.update({ _id: taskID }, {
        $push: { comment: req.body.comment },
        $inc: { commentNb: 1 }
    }, function(err, result) {
        if (err !== null) {
            console.log(err);
            res.send('ERROR');
        }
        else {
            console.log(result);
            res.json(result);
        }
    });
});

app.get('/todos', function(req, res) {
    var userID = req.query.userID;

    userTasks.find({ userid: userID, complete: false }).exec(function(err, userTasks) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(userTasks);
        }
    });
});

app.put('/todos', function(req, res) {
    var taskID = req.body.id;

    userTasks.findById(taskID, function(err, task) {
        if (err) return (err);

        task.complete = 'true';
        task.save(function(err, result) {
            if (err) return (err);
            res.json(result);
        });
    });
});

app.post('/file', function(req, res) {
    let appendFileToTask = req.body.selectedTask,
        amountOfComments = req.body.commentNb,
        fileUploadedToS3Adress,
        isAvatar = req.body.isAvatar,
        userID = req.body.userID;

    if (req.files) {
        let file = req.files.uploadFile,
            filename;

        if (userID != null) {
            filename = 'avatar' + userID + new Date().getTime();
        }
        else {
            filename = '' + appendFileToTask + amountOfComments + '.jpg'; //rename the file to be the task ID + the amount of comment so that the url stays unique if we are uploading a picture to a task
        }

        console.log(filename);

        s3.createBucket({ Bucket: bucketName }, function() {
            var params = {
                Bucket: bucketName,
                Key: filename,
                Body: file.data,
                ACL: 'public-read'
            };

            s3.putObject(params, function(err, data) {
                if (err)
                    console.log(err);
                else
                    fileUploadedToS3Adress = 'https://s3.ca-central-1.amazonaws.com/' + bucketName + '/' + filename;
                let fileUploadedToS3AdressToDisplayInD2D = '<img src="' + fileUploadedToS3Adress + '" />';

                if (isAvatar === 'true') {
                    // updating the user's avatar
                    User.update({ _id: userID }, {
                        $set: {
                            avatar: fileUploadedToS3Adress
                        }
                    }, function(err, result) {
                        if (err !== null) {
                            console.log(err);
                            res.send('ERROR');
                        }
                        else {
                            res.redirect('/');
                            console.log(result);
                        }
                    });
                }
                else {
                    // updating the task with the new picture
                    userTasks.update({ _id: appendFileToTask }, {
                        $push: { comment: fileUploadedToS3AdressToDisplayInD2D },
                        $inc: { commentNb: 1 }
                    }, function(err, result) {
                        if (err !== null) {
                            console.log(err);
                            res.send('ERROR');
                        }
                        else {
                            console.log(result);
                            res.redirect('/?task=' + appendFileToTask);
                        }
                    });
                }
            });
        });
    }
    else {
        res.send('please add a file to your request');
    }
});

//notes handling
app.get('/notes', function(req, res) {
    let userID = req.query.userID;

    userNotes.find({ userid: userID, archived: false }).exec(function(err, userNotes) {
        if (err) {
            console.log(err);
        }
        else {
            res.json(userNotes);
        }
    });
});

app.put('/notes', function(req, res) {
    var newNote = new userNotes({
        'archived': req.body.noteArchived,
        'noteBody': req.body.noteBody,
        'notePreview': req.body.notePreview,
        'noteTitle': req.body.noteTitle,
        'createdOn': req.body.noteCreatedOn,
        'editedOn': req.body.noteLastEditedOn,
        'userid': req.body.userid,
    });

    if (req.body.noteMongoID == 0) {
        newNote.save(function(err, result) {
            if (err !== null) {
                console.log(err);
                res.send('ERROR');
            }
            res.json(result);
        });
    }
    else {
        userNotes.update({ _id: req.body.noteMongoID }, {
            $set: {
                noteBody: newNote.noteBody,
                notePreview: newNote.notePreview,
                noteTitle: newNote.noteTitle,
                lastEditedOn: newNote.editedOn,
                archived: newNote.archived
            }
        }, function(err, result) {
            if (err !== null) {
                console.log(err);
                res.send('ERROR');
            }
            else {
                res.json(result);
                console.log(result);
            }
        });
    }
});

app.post('/forget', function(req, res) {
    let emailToResetPasswordFor = req.body.passwordToResetForEmail;
    if (validator.isEmail(emailToResetPasswordFor) === false) {
        res.send('not an email');
    }
    else {
        User.findOne({ email: emailToResetPasswordFor }, function(err, user) {
            if (err) { return (err); }
            if (!user) {
                res.send('No user match this email');
            }
            else {
                let userToUpdateID = user._id,
                    userToUpdateEmail = user.email,
                    userToUpdateresetPasswordExpires = Date.now() + 3600000,
                    userToUpdateresetPasswordToken = Math.floor(Math.random() * 1000000000),
                    emailLink = 'day2dayapp.net/reset.html?token=' + userToUpdateresetPasswordToken + '&userID=' + userToUpdateID;
                User.update({ _id: userToUpdateID }, {
                    $set: {
                        resetPasswordExpires: userToUpdateresetPasswordExpires,
                        resetPasswordToken: userToUpdateresetPasswordToken
                    }
                }, function(err, result) {
                    if (err !== null) {
                        console.log(err);
                        res.send('ERROR');
                    }
                    else {
                        res.json('succes');

                        //send the email to the user who lost his password
                        let data = {
                            from: 'Day2Day <mail@day2dayapp.net>',
                            to: userToUpdateEmail,
                            subject: 'Reset your password',
                            html: pug.renderFile('./emailTemplates/passwordResetEmail.pug', {
                                url: emailLink,
                            }),
                        };

                        mailgun.messages().send(data, function(error, body) {
                            console.log(body);
                        });
                    }
                });
            }
        });
    }
});

app.put('/resetpassword', function(req, res) {
    let userID = req.body.userid,
        resetPwdToken = req.body.resetPwdToken,
        newPassword = req.body.newPassword,
        newCryptedPassword = bcrypt.hashSync(newPassword, 10);

    User.findOne({ _id: userID }, function(err, user) {
        if (err) { console.log(err); }
        if (!user) {
            res.send('No user match this id');
        }
        else {
            // cheking the token
            if (resetPwdToken != user.resetPasswordToken) {
                console.log('wrong token, password will not be reset');
                res.send('wrong token');
            }
            // checking if the token is overdue
            else if (new Date(user.resetPasswordExpires).getTime() < Date.now()) {
                res.send('token overdue');
            }
            else {
                // update the password and reset the user's allowance to update his email
                User.update({ _id: userID }, {
                    $set: { password: newCryptedPassword, resetPasswordExpires: 0 }
                }, function(err) {
                    if (err !== null) {
                        console.log(err);
                        res.send('ERROR');
                    }
                    else {
                        res.json('password updated');
                        //send the email to the user who lost his password
                        let data = {
                            from: 'Day2Day <mail@day2dayapp.net>',
                            to: user.email,
                            subject: 'Your password has been updated',
                            html: pug.renderFile('./emailTemplates/passwordResetEmailSuccess.pug'),
                        };
                        mailgun.messages().send(data, function(error, body) {
                            console.log(body);
                        });
                    }
                });
            }
        }
    });
});

// sending pocket's API key over to client
app.get('/pocketKey', function(req, res) {

    let pocketRequestCode;

    console.log(req.body);

    var options = {
        method: 'POST',
        url: 'https://getpocket.com/v3/oauth/request',
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
        formData: {
            consumer_key: pocketConsumerKey,
            redirect_uri: 'http://day2dayapp.net?ref=pocket'
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log(error);
            res.send(error);
        }

        pocketRequestCode = body.split('=');

        res.send(pocketRequestCode[1]);
    });
});

// converting Pocket request token into an access token
app.get('/pocketKeyConfirm', function(req, res) {

    let pocketRequestCode = req.query.pocketRequestCode,
        userID = req.query.userID;

    var options = {
        method: 'POST',
        url: 'https://getpocket.com/v3/oauth/authorize',
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
        },
        form: {
            'consumer_key': pocketConsumerKey,
            'code': pocketRequestCode
        }
    };

    request(options, function(error, response, body) {
        if (error) {
            console.log(error);
        }
        else {
            // add the token to the user's account 
            User.update({ _id: userID }, {
                $set: {
                    integrations: {
                        pocket: {
                            connected: true,
                            token: body.split(/=|&/)[1]
                        }
                    }
                }
            }, function(err, User) {
                if (err !== null) {
                    console.log(err);
                    res.send('ERROR');
                }
                else {
                    console.log(User);
                    res.json(User);
                    analytics.track({
                        userId: userID,
                        event: 'Pocket Account connected',
                    });
                }
            });
        }
    });
});

// getting the user's reading list
app.get('/getUsersPocketReadList', function(req, res) {
    User.findById(req.query.userID, function(err, user) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            var options = {
                method: 'POST',
                url: 'https://getpocket.com/v3/get',
                qs: {
                    consumer_key: pocketConsumerKey,
                    access_token: user.integrations.pocket.token,
                    state: 'unread',
                    sort: 'newest',
                    detailType: 'complete',
                    // count: '10'
                },
                headers: {
                    'cache-control': 'no-cache'
                }
            };

            request(options, function(error, response, body) {
                if (error) throw new Error(error);
                res.send(body);
            });
        }
    });
});

app.post('/markArticleRead', function(req, res) {
    console.log(req.body);

    var options = {
        method: 'GET',
        url: 'https://getpocket.com/v3/send',
        qs: {
            consumer_key: pocketConsumerKey,
            access_token: req.body.pocketToken,
            actions: '[{"action":"archive", "item_id":"' + req.body.pocketArticleRead + '"}]'
        },
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);

        res.send(body);
    });
});

app.post('/addnewpocketarticle', function(req, res) {
    console.log(req.body);

    console.log(validator.isURL(req.body.url));

    if (validator.isURL(req.body.url) === true) {
        var options = {
            method: 'GET',
            url: 'https://getpocket.com/v3/add',
            qs: {
                consumer_key: pocketConsumerKey,
                access_token: req.body.pocketToken,
                url: req.body.url
            },
        };

        request(options, function(error, response, body) {
            if (error) throw new Error(error);
            res.send(body);
        });
    }
    else {
        res.send('not a link');
    }
});

app.post('/googleAuth', function(req, res) {
    let newGoogleUser = new User({
        username: req.body.fullName,
        email: req.body.email,
        avatar: req.body.avatar,
        settings: {
            temperatureUnit: 'celsius',
            backgroundPicture: 'nature'
        },
        integrations: {
            google: {
                connected: true,
            }
        }
    });

    let googleToken;

    let options = {
        method: 'GET',
        url: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
        qs: { id_token: req.body.googleToken },
    };

    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        googleToken = JSON.parse(body).sub;
        newGoogleUser.integrations.google.token = googleToken;
        // adding the user's token within his profile
        User.findOne({ email: newGoogleUser.email }, function(err, user) {
            if (err) {
                console.log(err);
            }
            else if (user != null) { // case where the user exists
                console.log('googleToken final ' + googleToken);
                User.update({ _id: user._id }, {
                    $set: {
                        'integrations.google.connected': true,
                        'integrations.google.token': newGoogleUser.integrations.google.token
                    }
                }, function(err, User) {
                    if (err !== null) {
                        console.log(err);
                        res.send('ERROR');
                    }
                    else {
                        console.log(user)
                        analytics.track({
                            anonymousId: 'unknown',
                            event: 'Google Account connected',
                        });
                    }
                });
                res.send(user);
            }
            else {
                createUser(newGoogleUser, res);
            }
        });
    });
});

// landing registration
app.post('/authRegistration', function(req, res) {
    console.log(req.body);
    res.send('200');
});

// general functions
function createUser(newUser, res) {
    console.log('test');
    console.log(newUser);
    newUser.save(function(err, result) {
        if (err !== null) {
            console.log(err);
            return res.send("ERROR");
        }
        else {
            analytics.track({
                anonymousId: 'unknown',
                event: 'New account created',
            });
            //send a nice welcome email to our new user
            let data = {
                from: 'Day2Day <mail@day2dayapp.net>',
                to: newUser.email,
                subject: 'Welcome to Day2Day',
                html: pug.renderFile('./emailTemplates/welcomeEmail.pug', {
                    userName: newUser.username
                }),
            };

            mailgun.messages().send(data, function(error, body) {
                console.log(body);
            });
            return res.send(result);
        }
    });
}
