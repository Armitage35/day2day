var express = require('express'),
    http = require('http'),
    mongoose = require('mongoose'),
    User = require('./models/users.js'),
    userTasks = require('./models/tasks.js'),
    validator = require('validator'),
    session = require('express-session'),
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    gravatar = require('gravatar'),
    app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.urlencoded());
app.use(express.session({ secret: 'oiuerrweioiurew', /*resave: false, */ saveUninitialize: false }));
app.use(passport.initialize());
app.use(passport.session());

//connect mongoose to DB
mongoose.connect('mongodb://localhost/day2day');

var port = process.env.PORT || 80;
http.createServer(app).listen(port);
console.log("app working on port " + port)

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

//user login
app.post('/login', function(req, res) {
    passport.authenticate('local', { session: true }, function(err, user, info) {
        if (err) { return err; }
        if (!user) { return res.send('not found'); }
        req.logIn(user, function(err) {
            console.log("user am logging in" + user);
            return res.json(user._id);
        });
    })(req, res);


passport.serializeUser(function(user, done) {
        done(null, user._id);
        console.log(user);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    }); 
});

//user registration handling
app.post("/user", function(req, res) {
    console.log(req.body);

    var tempID = req.body.tempUserid,
        username = req.body.username,
        email = req.body.email,
        password = req.body.password,
        avatar = gravatar.url(req.body.email, {protocol: 'https'}),
        passwordRepeat = req.body.passwordRepeat,
        hashedPassword = bcrypt.hashSync(password, 10); //hash password syncronously

    var newUser = new User({
        "tempID": tempID,
        "username": username,
        "email": email,
        "password": hashedPassword,
        "avatar": avatar,
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
        console.log("email taken " + emailTaken);

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
        } else {
            newUser.save(function(err, result) {
                if (err !== null) {
                    console.log(err);
                    res.send("ERROR");
                }
                else {
                    console.log(result);
                    res.send(result);
                }
            });
        }
        console.log(error);
    });
});

//tasks handling
app.post("/todos", function(req, res) {
    console.log(req.body);
    var newTask = new userTasks({
        "comment": req.body.userTasks.comment,
        "commentNb": req.body.userTasks.commentNb,
        "complete": req.body.userTasks.complete,
        "createdOn": req.body.userTasks.createdOn,
        "dueDate": req.body.userTasks.dueDate,
        "id": req.body.userTasks.id,
        "title": req.body.userTasks.title,
        "userid": req.body.userTasks.userID
    });

    newTask.save(function(err, result) {
        if (err !== null) {
            console.log(err);
            res.send("ERROR");
        }
        res.json(result);
    });
});

app.put("/todos/comment", function(req, res) {
    console.log(req.body);
    var taskID = req.body.id;

    userTasks.findById(taskID, function(err, task) {
        if (err) return handleError(err);
        task.comment.push(req.body.comment);
        task.commentNb = req.body.commentNb;
        task.save(function(err, result) {
            if (err) return handleError(err);
            res.json(result);
        });
    });

});

app.get("/todos", function(req, res) {
    console.log(req.query);
    var userID = req.query.userID;

    userTasks.find({ userid: userID, complete: false }).exec(function(err, userTasks) {
        if (err) {
            console.log("an error has occured");
        }
        else {
            console.log(userTasks);
            res.json(userTasks);
        }
    });
});

app.put("/todos", function(req, res) {
    console.log(req.body);
    var taskID = req.body.id;

    userTasks.findById(taskID, function(err, task) {
        if (err) return handleError(err);

        task.complete = 'true';
        task.save(function(err, result) {
            if (err) return handleError(err);
            res.json(result);
        });
    });

});