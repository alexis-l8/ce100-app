'use strict';

var email = require('sendemail');
var sendEmail = {};

email.set_template_directory('server/email-templates');

sendEmail.newUser = function (recipient, callback) {
  email('welcome', recipient, callback);
};

module.exports = sendEmail;
