var mongoose = require("mongoose");

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

module.exports =  mongoose.model('Task', TaskSchema);