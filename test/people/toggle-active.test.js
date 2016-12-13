'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var admin = { cookie: 'token=' + sessions.tokens(config.jwt_secret).admin_1 };
var primary = { cookie: 'token=' + sessions.tokens(config.jwt_secret).primary_3 };
var uid = 3;
var unauthUid = 9;
var nonExistentUid = 5000;

function browsePeople (token) {
  return {
    method: 'GET',
    url: '/people',
    headers: token
  };
}

function toggleUser (token, userId) {
  return {
    method: 'POST',
    url: '/people/' + userId + '/toggle-active',
    headers: token
  };
}

tape('Admin can activate/deactivate a user account', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleUser(admin, uid), function (res) {
        t.equal(res.statusCode, 302, 'admin has permission to deactivate user account');
        server.inject(toggleUser(admin, unauthUid), function (res) {
          t.equal(res.statusCode, 302, 'admin has permission to activate user account');
          server.inject(toggleUser(admin, nonExistentUid), function (res) {
            t.equal(res.statusCode, 500, 'admin cannot toggle a non-existent user account');
            server.inject(browsePeople(primary), function (res) {
              t.ok(res.payload.indexOf('Sally Robbins') === -1, 'Sally Robbins is no longer displayed (deactivated)');
              t.ok(res.payload.indexOf('Frank Goldsmith') > -1, 'Frank Goldsmiths is displayed (activated)');
              t.end();
              pool.end();
              server.stop();
            });
          });
        });
      });
    });
  });
});

tape('Primary cannot activate/deactivate user account', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleUser(primary, uid), function (res) {
        t.equal(res.statusCode, 401, 'primary does not have permission to activate/deactivate user account');
        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
