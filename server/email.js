require('env2')('config.env');
var email = require('sendemail');
email.set_template_directory('server/email-templates');

var sendEmail = {};

sendEmail.newUser = (person, callback) => {
  const recipient = Object.assign({}, person, { subject: "Welcome to CE100!" })

  email('welcome', recipient, function (error, result) {
    console.log('WELCOME EMAIL:', error, result);
    if (error) console.log(error);
    callback(error, result);
  });
};

module.exports = sendEmail;
