var Hoek = require('hoek');
var email = require('sendemail');
email.set_template_directory('server/email-templates');

var sendEmail = {};

sendEmail.newUser = (person, callback) => {
  var recipient = Object.assign({}, person, { subject: 'Welcome to CE100!' });

  email('welcome', recipient, function (error, result) {
    console.log('WELCOME EMAIL:', error, result);
    Hoek.assert(!error, 'Send email error');
    callback(error, result);
  });
};

module.exports = sendEmail;
