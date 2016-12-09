'use strict';

var tape = require('tape');
var jwt = require('jsonwebtoken');

var init = require('../../server/server.js');
var config = require('../../server/config.js');

var activateAccount = function (userId, payload) {
  return {
    method: 'POST',
    url: '/people/activate/' + jwt.sign(userId, config.jwt_secret),
    payload: payload
  };
};

var goodPassword = {
  password: 'Hello1',
  confirm_password: 'Hello1'
}

var shortPassword = {
  password: 'Hello',
  confirm_password: 'Hello'
}

var unmatchingPasswords = {
  password: 'Hello1',
  confirm_password: 'Hello2'
}

// good password
tape('activate account with not yet activated user, good password: --> ' + __filename, function (t) {
  init(config, function (err, server, pool) {
    t.ok(!err, 'No error on init server: ', err);
    server.inject(activateAccount(8, goodPassword), function (res) {
      t.equal(res.statusCode, 302, 'redirects');
      t.ok(res.headers['set-cookie'], 'successful activation adds a session cookie');
      t.end();
      server.stop();
      pool.end();
    });
  });
});

// short password
tape('short password fails validation: --> ' + __filename, function (t) {
  init(config, function (err, server, pool) {
    t.ok(!err, 'No error on init server: ', err);
    server.inject(activateAccount(8, shortPassword), function (res) {
      t.equal(res.statusCode, 401, 'error');
      t.ok(res.payload.indexOf('password length must be at least 6 characters long') > -1, 'correct message is displayed');
      t.end();
      server.stop();
      pool.end();
    });
  });
});

// unmatching passwords
tape('unmatching passwords fails validation: --> ' + __filename, function (t) {
  init(config, function (err, server, pool) {
    t.ok(!err, 'No error on init server: ', err);
    server.inject(activateAccount(8, unmatchingPasswords), function (res) {
      t.equal(res.statusCode, 401, 'error');
      t.ok(res.payload.indexOf('confirm password must match password') > -1, 'correct message is displayed');
      t.end();
      server.stop();
      pool.end();
    });
  });
});
