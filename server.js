var express = require("express"),
    http = require("http"),
    mongoose = require("mongoose"),
    app = express();

app.use(express.static(__dirname + "/client"));
app.use(express.urlencoded());

//connect mongoose to DB
mongoose.connect('mongodb://localhost/tasks');

//This is mongoose's model for todos
var TaskSchema = mongoose.Schema({
    comment: [],
    commentNb: Number,
    complete: Boolean,
    createdOn: Date,
    dueDate: Date,
    id: Number,
    title: String,
});

var userTasks = mongoose.model("Task", TaskSchema);

var port = process.env.PORT; //only for Cloud9
http.createServer(app).listen(port);

//this route gets tasks
/* app.get("/todos.json", function(req, res) {
    userTask.find({}, function(err, userTask) {
        res.json(userTask);
    });
}); */

app.post("/todos", function(req, res) {
    console.log(req.body);
    var newTask = new userTasks({
        "comment": req.body.userTasks.comment,
        "commentNb": req.body.userTasks.commentNb,
        "complete": req.body.userTasks.complete,
        "createdOn": req.body.userTasks.createdOn,
        "dueDate": req.body.userTasks.dueDate,
        "id": req.body.userTasks.id,
        "title": req.body.userTasks.title
    });

    newTask.save(function(err, result) {
        if (err !== null) {
            console.log(err);
            res.send("ERROR");
        }
        else {
            // our client expects *all* of the todo items to be returned so we do an additional request to maintain compatibility
            /* userTasks.find({}, function(err, result) {
                if (err !== null) {
                    //the element did not get saved
                    res.send("ERROR");
                }
                res.json(result);
            }); */
        } res.json(result);
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
