'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret).admin;
var primaryToken = sessions.tokens(config.jwt_secret).primary;
var adFiltered, prFiltered, filterRegex;
var filterTag = {
  id: 69,
  name: 'Design for disassembly'
};

var browseAll = function (cookie, filter) {
  return {
    method: 'GET',
    url: filter ? '/challenges?tags=' + filter : '/challenges',
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

// challenges are filtered correctly
tape('access /challenges?tags=' + filterTag.id + ' as a logged-in admin',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'no initialising error');
        server.inject(browseAll(adminToken, filterTag.id), function (adRes) {
          adFiltered = adRes.payload;
          server.inject(browseAll(primaryToken, filterTag.id), function (prRes) {
            prFiltered = prRes.payload;
            filterRegex = new RegExp('Design for disassembly', 'g');
            t.deepEqual(adFiltered.match(filterRegex),
              prFiltered.match(filterRegex),
              'admin and primary have the same filtered view');
            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });
});
