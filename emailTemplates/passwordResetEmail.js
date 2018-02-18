const pug = require('pug');

var resetEmail = pug.compileFile('emailTemplates/passwordResetEmail.pug');

module.exports = resetEmail;