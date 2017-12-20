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

var ToDo = mongoose.model("ToDo", ToDoSchema);

var port = process.env.PORT; //only for Cloud9
var fs = require('fs'); //activate node file system
http.createServer(app).listen(port);

//this route takes the place of our todos.json in our former exemple
app.get("/todos.json", function(req, res) {
    res.json(userTask);
});

app.post("/todos", function (req, res){
    var userTask = req.body;
    userTask = JSON.stringify(userTask);
    fs.writeFile('todos.json', userTask, 'utf8', function (err) {if (err) throw err; console.log('Saved!');});
    console.log(userTask);
   
   //send back a simple object
   res.json(userTask);
});