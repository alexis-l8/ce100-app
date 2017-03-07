'use strict';

var tape = require('tape');
var sinon = require('sinon');


var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sendEmail = require('sendemail');


function passwordReset (email) {
  return {
    url: '/password-reset',
    method: 'POST',
    payload: { email: email }
  };
}


tape('/password-reset (GET) - password reset view: --> ' + __filename, function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server: ' + error);
    server.inject({ url: '/password-reset' }, function (res) {
      t.equal(res.statusCode, 200, 'GET route exists with no auth');
      t.ok(res.payload.indexOf('Send email') > -1, 'Correct view is displayed');

      t.end();
      server.stop();
      pool.end();
    });
  });
});


tape('/password-reset (POST) - password reset good email: --> ' + __filename, function (t) {
  var expectedUser = {
    subject: 'Reset your password for the CE100 member\'s area',
    url: config.root_url,
    email: 'sa@ro.co',
    first_name: 'Sally',
    last_name: 'Robbins'
  };

  var emailSender = sinon.stub(sendEmail, 'email', function (str, user, cb) {
    // delete the hashed email address as it contains an encrypted time which is difficult to recreate
    delete user.hashedId;
    t.deepEqual(user, expectedUser, 'send email function called with the correct user details');
    cb(null)
  });

  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server: ' + error);
    server.inject(passwordReset('sa@ro.co'), function (res) {
      t.ok(emailSender.calledWith('reset'), 'correct email template is used');
      emailSender.restore();
      t.equal(res.statusCode, 200, 'valid user can send their email address for a password reset email');
      t.ok(res.payload.indexOf('You have just been sent an email containing a link to reset your password.') > -1,
        'valid email address receives notification of sent email');


      t.end();
      server.stop();
      pool.end();
    });
  });
});


tape('/password-reset (POST) - password reset with bad email: --> ' + __filename, function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(passwordReset('non@recognised.email'), function (res) {
      t.equal(res.statusCode, 400, 'invalid email address returns 400');
      t.ok(res.payload.indexOf('Email not found') > -1, 'invalid email address warning');

      t.end();
      server.stop();
      pool.end();
    });
  });
});
