var express = require("express"),
    http = require("http"),
    app = express();
    
app.use(express.static(__dirname + "/client"));
app.use(express.urlencoded());

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