'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adFiltered, prFiltered, filterRegex;
var filterTag = {
  id: 69,
  name: 'Design for disassembly'
};

var browseAll = function (user, filter) {
  return {
    method: 'GET',
    url: filter ? '/challenges?tags=' + filter : '/challenges',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
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
          t.equal(
            res.statusCode,
            302,
            'request an endpoint requiring auth get 302');
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
      server.inject(browseAll('admin_1'), function (res) {
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
      server.inject(browseAll('primary_3'), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to admin');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

//
tape('/challenges?tags=' + filterTag.id + ' - challenges are filtered correctly for admin, primary and secondary: --> ' + __filename,
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'no initialising error');
        server.inject(browseAll('admin_1', filterTag.id), function (adminRes) {
          server.inject(browseAll('primary_3', filterTag.id), function (primaryRes) {
            server.inject(browseAll('secondary_12', filterTag.id), function (secondaryRes) {
              // split at each challenge card
              var admin = adminRes.payload.split('<li class="list__item ');
              var primary = primaryRes.payload.split('<li class="list__item ');
              var secondary = secondaryRes.payload.split('<li class="list__item ');

              // check that they each have equal number of challenges displayed
              t.equal(admin.length-1, 2, 'admin can see correct number of challenges');
              t.equal(primary.length-1, 2, 'primary can see correct number of challenges (same as admin)');
              t.equal(secondary.length-1, 2, 'secondary can see correct number of challenges (same as admin and primary)');
              t.end();
              server.stop();
              pool.end();
            });
          });
        });
      });
    });
});
