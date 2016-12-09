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

// check new user with above payloads

tape('activate account with not yet activated user, good password: --> ' + __filename, function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(activateAccount(8, goodPassword), function (res) {
      t.equal(res.statusCode, 302, 'redirects');
      t.end();
      server.stop();
      pool.end();
    });
  });
});
