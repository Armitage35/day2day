var express = require("express"),
    http = require("http"),
    mongoose = require("mongoose"),
    validator = require('validator'),
    app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.urlencoded());

//connect mongoose to DB
mongoose.connect('mongodb://localhost/day2day');

//This is mongoose's model for todos
var TaskSchema = mongoose.Schema({
    comment: [],
    commentNb: Number,
    complete: Boolean,
    createdOn: Date,
    dueDate: Date,
    id: Number,
    title: String,
    userid: String,
});

var userTasks = mongoose.model("Task", TaskSchema);

//This is mongoose's model for users
var UserSchema = mongoose.Schema({
    email: String,
    password: String,
    createdOn: Date,
    lastConnected: Date,
    username: String,
    city: String,
    avatar: String,
    tempID: Number
});

var User = mongoose.model("User", UserSchema);

var port = process.env.PORT; //only for Cloud9
http.createServer(app).listen(port);

//user handling
app.post("/user", function(req, res) {
    console.log(req.body);

    var tempID = req.body.tempUserid;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var passwordRepeat = req.body.passwordRepeat;
    var emailTaken;
    var newUser = new User({
        "tempID": tempID,
        "username": username,
        "email": email,
        "password": password,
    });

    User.findOne({ 'email': email }, function(err, User) {
        if (err) {
            return handleError(err); 
        } else if (User === null) {
            emailTaken = false;
        } else {
            emailTaken = true;
        }
    })

    //making required checks on user info
    if (validator.isEmail(email) === false) {
        res.redirect('/auth.html?e=' + encodeURIComponent('Email is not valid'));
    }
    else if (password != passwordRepeat) {
        res.redirect('/auth.html?e=' + encodeURIComponent('Password do not match'));
    } else if (emailTaken != true) {
        res.redirect('/auth.html?e=' + encodeURIComponent('Email is alerady taken'));
    } else {
        newUser.save(function(err, result) {
            if (err !== null) {
                console.log(err);
                res.send("ERROR");
            }
            res.json(result);
        });
    }
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
