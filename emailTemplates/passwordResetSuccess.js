const pug = require('pug');

var resetEmailSuccess = pug.compileFile('emailTemplates/passwordResetSuccess.pug');
	
module.exports = resetEmailSuccess;