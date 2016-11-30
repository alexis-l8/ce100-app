'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret).admin;
var primaryToken = sessions.tokens(config.jwt_secret).primary;
var adFiltered, prFiltered;

var browseAll = function (cookie, filter) {
  return {
    method: 'GET',
    url: filter ? '/challenges' : '/challenges?tags' + filter,
    headers: { cookie: 'token=' + cookie }
  };
};

// all challenges length > filtered challenges

// fail to access /challenges IF NOT LOGGED IN
tape('/challenges endpoint unsuccessful when not logged in',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(browseAll(), function (res) {
          t.equal(res.statusCode, 401,
            'request an endpoint requiring auth get 401');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

// /challenges route accessible by admin
tape('access /challenges as a logged-in admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(adminToken), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to admin');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// /challenges route accessible by primary
tape('access /challenges as a logged-in primary user', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(primaryToken), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to admin');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
