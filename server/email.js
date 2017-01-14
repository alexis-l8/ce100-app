'use strict';

var sendEmail = require('sendemail');
var sender = {};

sendEmail.set_template_directory('server/email-templates');

sender.newUser = function (recipient, callback) {
  sendEmail.email('welcome', recipient, callback);
};

module.exports = sender;
