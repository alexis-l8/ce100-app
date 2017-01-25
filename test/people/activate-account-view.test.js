'use strict';

var tape = require('tape');
var jwt = require('jsonwebtoken');

var init = require('../../server/server.js');
var config = require('../../server/config.js');


var activateAccountView = function (userId) {
  return {
    method: 'GET',
    url: '/people/activate/' + jwt.sign({ id: userId }, config.jwt_secret)
  };
};


tape('activate account view for already activated user', function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(activateAccountView(3), function (res) {
      t.equal(res.statusCode, 302, 'redirects');
      t.end();
      server.stop();
      pool.end();
    });
  });
});


tape('activate account view with nonsense user id', function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(activateAccountView(100000), function (res) {
      t.equal(res.statusCode, 404, 'not found');
      t.end();
      server.stop();
      pool.end();
    });
  });
});


tape('activate account view with unactivated user id', function (t) {
  init(config, function (error, server, pool) {
    t.ok(!error, 'No error on init server');
    server.inject(activateAccountView(8), function (res) {
      t.equal(res.statusCode, 200, 'correct user can see the view');

      t.end();
      server.stop();
      pool.end();
    });
  });
});
