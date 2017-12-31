var express = require("express"),
    http = require("http"),
    mongoose = require("mongoose"),
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
    name: String,
    city: String,
    avatar: String,
    tempID: Number
});

var User = mongoose.model("User", UserSchema);

var port = process.env.PORT; //only for Cloud9
http.createServer(app).listen(port);

//this route gets tasks
/* app.get("/todos.json", function(req, res) {
    userTask.find({}, function(err, userTask) {
        res.json(userTask);
    });
}); */

app.post("/user", function(req, res) {
    console.log(req.body);
    var newUser = new User({
        "tempID": req.body.tempUserid,
    });

    newUser.save(function(err, result) {
        if (err !== null) {
            console.log(err);
            res.send("ERROR");
        }
        res.json(result);
    });
});

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
