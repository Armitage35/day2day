var mongoose = require("mongoose");

//This is mongoose's model for todos
var NoteSchema = mongoose.Schema({
    noteBody: String,
    notePreview: String,
    noteTtitle: String,
    createdOn: Date,
    id: Number,
    title: String,
    userid: String,
});

var userNotes = mongoose.model("Task", NoteSchema);

module.exports =  mongoose.model('Task', NoteSchema);