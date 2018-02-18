const pug = require('pug');

var welcomeEmail = pug.compileFile('emailTemplates/welcomeEmail.pug');
	
module.exports = welcomeEmail;