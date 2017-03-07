'use strict';

var sendEmail = require('sendemail');
var jwt = require('jsonwebtoken');
var config = require('./config.js');

sendEmail.set_template_directory('server/email-templates');

var subjects = {
  welcome: 'Activate your CE100 member\'s area account',
  reset: 'Reset your password for the CE100 member\'s area'
};

function send (emailType, user, callback) {
  var expiresIn = emailType === 'reset' && { expiresIn: 60*5 }

  var emailOptions = {
    hashedId: jwt.sign({id: user.id}, config.jwt_secret, expiresIn),
    subject: subjects[emailType],
    url: config.root_url,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
  };

  sendEmail.email(emailType, emailOptions, callback)
}

module.exports = send;
