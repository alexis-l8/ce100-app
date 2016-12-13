var Hoek = require('hoek');
var email = require('sendemail');
email.set_template_directory('server/email-templates');

var sendEmail = {};

sendEmail.newUser = function (recipient, callback) {
  email('welcome', recipient, callback);
};

module.exports = sendEmail;
