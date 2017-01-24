'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var landingPage = function (user) {
  return {
    method: 'GET',
    url: '/',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
};

// admin gets redirected to /orgs
tape('/ (GET) - admin and primary routes: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'No error on init server');
      server.inject(landingPage('admin_1'), function (res) {
        t.equal(res.statusCode, 302, 'admin gets redirected');
        t.equal(res.headers.location, '/orgs', 'admin redirected to /orgs');
        server.inject(landingPage('primary_3'), function (res) {
          t.equal(res.statusCode, 200, 'primary has access to landing page');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});

// primary is correctly greeted
tape('/ (GET) - primary correctly greeted: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'No error on init server');
      server.inject(landingPage('primary_3'), function (res) {
        t.ok(res.payload.indexOf('Welcome Sally') > -1, 'name is correctly displayed');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// primary and secondary are displayed correct options
tape('/ (GET) - options displayed correctly for primary and secondary: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'No error on init server');
      server.inject(landingPage('primary_3'), function (res) {
        t.equal(res.payload.split('<li class="landing-card">').length - 1, 5, 'primary offered the correct number of activities/options');
        t.ok(res.payload.indexOf('Share a challenge') > -1, 'primary is offered the option to share a challenge');
        server.inject(landingPage('secondary_12'), function (res) {
          t.equal(res.payload.split('<li class="landing-card">').length - 1, 4, 'secondary offered the correct number of activities/options');
          t.ok(res.payload.indexOf('Share a challenge') === -1, 'secondary is not offered the option to share a challenge');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});
