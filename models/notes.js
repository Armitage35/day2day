var mongoose = require("mongoose");

//This is mongoose's model for todos
var NoteSchema = mongoose.Schema({
    archived: Boolean,
    createdOn: Date,
    noteBody: String,
    notePreview: String,
    noteTitle: String,
    lastEditedOn: Date,
    id: Number,
    userid: String,
});

var userNotes = mongoose.model('Note', NoteSchema);

module.exports =  mongoose.model('Note', NoteSchema);