var express = require("express"),
    http = require("http"),
    mongoose = require("mongoose"),
    app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.urlencoded());

//connect mongoose to DB
mongoose.connect('mongodb://localhost/my_database');

//This is mongoose's model for todos
var userTaskSchema = mongoose.Schema({
    comment: [String],
    commentNb: Number,
    complete: Boolean,
    createdOn: Date,
    dueDate: Date,
    id: Number,
    title: String
});

var userTask = mongoose.model("userTask", userTaskSchema);

var port = process.env.PORT; //only for Cloud9
var fs = require('fs'); //activate node file system
http.createServer(app).listen(port);

//this route takes the place of our todos.json in our former exemple
app.get("/todos.json", function(req, res) {
    userTask.find({}, function(err, userTask) {
        res.json(userTask);
    });
});

app.post("/todos", function(req, res) {
    console.log(req.body);
    var newUserTask = new userTask({
        "comment": req.body.comment,
        "commentNb": req.body.commentNb,
        "complete": req.body.complete,
        "createdOn": req.body.createdOn,
        "dueDate": req.body.dueDate,
        "id": req.body.id,
        "title": req.body.title
    });
    newUserTask.save(function (err, result){
        if (err !== null){
            console.log(err);
            res.send("ERROR");
        } else {
            // our client expects *all* of the todo items to be returned
            // so we do an additional request to maintain compatibility
            userTask.find({}, function (err, result) {
                if (err !== null) {
                    //the element did not get saved
                    res.send("ERROR");
                }
                res.json(result);
            });
        }
    });
});
