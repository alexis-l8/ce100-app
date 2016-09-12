var email = require('sendemail');
email.set_template_directory('server/email-templates');

var Hoek = require('hoek');
var sendEmail = {};

sendEmail.newUser = (person, callback) => {
  const recipient = Object.assign({}, person, { subject: 'Welcome to CE100!' });

  // someone please add sender email address to .env Google Doc! then uncomment
  // see: https://github.com/dwyl/sendemail#2-set-your-environment-variables

  // email('welcome', recipient, function (error, result) {
    // console.log('WELCOME EMAIL:', error, result);
    // Hoek.assert(!error, 'Send email error'); // uncomment this when you have valid sender email in .env
    // callback(error, result);
  // });

  callback(null, true); // remove this line after adding sender email to .env
};

module.exports = sendEmail;
