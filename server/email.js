'use strict';

var sendEmail = require('sendemail');
var jwt = require('jsonwebtoken');
var config = require('./config.js');

sendEmail.set_template_directory('server/email-templates');

var subjects = {
  welcome: 'Welcome to CE100!',
  reset: 'CE100 password reset requested'
}

function send (emailType, user, callback) {
  console.log('--------' + jwt.verify('eyJhbGciOiJIUzI1NiJ9.am11cnBoeS53ZWJAZ21haWwuY29t.qfXM9oCRSWGroO8YSTCZz9amZ4EniCQJGM3T3IYbBMY', config.jwt_secret));
  // console.log(emailType, user);
  var emailOptions = {
    hashedId: jwt.sign(user.id, config.jwt_secret),
    subject: subjects[emailType],
    url: config.root_url,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
  }
console.log(emailOptions);
  sendEmail.email(emailType, emailOptions, callback)
}

module.exports = send;
