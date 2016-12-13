'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var admin = { cookie: 'token=' + sessions.tokens(config.jwt_secret).admin_1 };
var primary = { cookie: 'token=' + sessions.tokens(config.jwt_secret).primary_3 };
var challengeId = 1;

function editChallenge (token) {
  return {
    method: 'GET',
    url: '/challenges/' + challengeId + '/edit',
    headers: token
  };
}

function toggleActivity (token) {
  return {
    method: 'POST',
    url: '/challenges/' + challengeId + '/toggle-active',
    headers: token
  };
}

tape('Admin cannot unarchive/archive a challenge', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleActivity(admin), function (res) {
        t.equal(unarchived.statusCode, 401, 'admin does not have permission to unarchive/archive challenge');
        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});

tape('Primary can unarchive/archive a challenge', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(editChallenge(primary), function (res) {
        t.ok(res.payload.indexOf('Unarchive Challenge') > -1, 'chal is archived to begin with');
        server.inject(toggleActivity(primary), function (unarchived) {
          t.equal(unarchived.statusCode, 302, 'primary is redirected after enabling a chal');
          server.inject(editChallenge(primary), function (res) {
            t.ok(res.payload.indexOf('Archive Challenge') > -1, 'chal successfuly unarchived');
            server.inject(toggleActivity(primary), function (archived) {
              t.equal(archived.statusCode, 302, 'primary is redirected after disabling a chal');
              server.inject(editChallenge(primary), function (res) {
                t.ok(res.payload.indexOf('Unarchive Challenge') > -1, 'chal successfuly archived');
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
});
