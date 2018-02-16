var mongoose = require("mongoose");

//This is mongoose's model for users
var UserSchema = mongoose.Schema({
    email: String,
    password: String,
    createdOn: Date,
    lastConnected: Date,
    username: String,
    city: String,
    avatar: String,
    tempID: Number,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

var User = mongoose.model("User", UserSchema);

module.exports = mongoose.model('User', UserSchema);
