'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];
var authId = 3;
var unauthId = 6;

function editProfile (token, id, update) {
  return {
    method: update ? 'POST' : 'GET',
    url: '/people/' + id + '/edit',
    headers: { cookie: 'token=' + token },
    payload: !update ? undefined : update
  };
}

function viewOrgProfile (token) {
  return {
    url: '/orgs/{id}',
    headers: { cookie: 'token=' + token },
  };
}

tape('/people/{id}/edit GET endpoint for unauthed user, admin and primary user',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(null, authId, null), function (res) {
          t.equal(res.statusCode, 401, 'unauthed user: no access');
          server.inject(editProfile(adminToken, authId, null), function (res) {
            t.equal(res.statusCode, 200, 'admin authorised to access view');
            server.inject(editProfile(primaryToken, authId, null), function (res) {
              t.equal(res.statusCode, 200, 'primary authorised to access view');
              server.inject(editProfile(adminToken, unauthId, null), function (res) {
                t.equal(res.statusCode, 200, 'admin authorised to access settings view of any user');
                server.inject(editProfile(primaryToken, unauthId, null), function (res) {
                  t.equal(res.statusCode, 401, 'primary unauthorised to access settings view of another primary user');
                  t.end();
                  server.stop();
                  pool.end();
                });
              });
            });
          });
        });
      });
    });
  });

tape('/people/{id}/edit GET endpoint for unauthed user, admin and primary user',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(null, authId, null), function (res) {
          t.equal(res.statusCode, 401, 'unauthed user: no access');
          server.inject(editProfile(adminToken, authId, null), function (res) {
            t.equal(res.statusCode, 200, 'admin authorised to access view');
            server.inject(editProfile(primaryToken, authId, null), function (res) {
              t.equal(res.statusCode, 200, 'primary authorised to access view');
              t.end();
              server.stop();
              pool.end();
            });
          });
        });
      });
    });
  });
