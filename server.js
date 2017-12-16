var express = require("express"),
    http = require("http"),
    app = express();
    
app.use(express.static(__dirname + "/client"));
app.use(express.urlencoded());

var port = process.env.PORT;
var fs = require('fs');
http.createServer(app).listen(port);

//this route takes the place of our todos.json in our former exemple
app.get("/todos.json", function(req, res) {
    res.json(userTask);
});

app.post("/todos", function (req, res){
    console.log("data has been posted to the server");
    var userTask = req.body;
    var yolo = JSON.stringify(userTask);
    fs.writeFile('todos.json', yolo, 'utf8', function (err) {if (err) throw err; console.log('Saved!');});
    //console.log(userTask);
    console.log(yolo);
   
   //send back a simple object
   res.json(userTask);
});