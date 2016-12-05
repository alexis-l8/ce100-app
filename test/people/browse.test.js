'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret).admin_1;
var primaryToken = sessions.tokens(config.jwt_secret).primary_3;

var browseAll = function (cookie) {
  return {
    method: 'GET',
    url: '/people',
    headers: { cookie: 'token=' + cookie }
  };
};

// all people length > filtered people

// fail to access /people IF NOT LOGGED IN
tape('/people endpoint unsuccessful when not logged in',
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

// /people route accessible by admin
tape('access /people as a logged-in admin', function (t) {
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

// /people route accessible by primary
tape('access /people as a logged-in primary user', function (t) {
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

// /people route displays all active and inactive users to admins
tape('check all active + inactive users displayed', function (t) {
  var userIdentifier = '<span class="list__data list__data--primary">';
  var regex = new RegExp(userIdentifier, 'g');

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(adminToken), function (res) {
        t.equal(res.payload.match(regex).length, 11, 'all users displayed');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// /people route displays all active and inactive users to admins
tape('check only active users displayed', function (t) {
  var userIdentifier = '<span class="list__data list__data--primary">';
  var regex = new RegExp(userIdentifier, 'g');

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(primaryToken), function (res) {
        t.equal(res.payload.match(regex).length, 9, 'active users displayed');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// /people route displays users in alphabetical order (admin)
tape('check users in alphabetical order', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(primaryToken), function (res) {
        t.ok(res.result.indexOf('Ben Matthews')
          > res.result.indexOf('Alex Wijns'),
          'Alex followed by Ben (first name)');
        t.ok(res.result.indexOf('Gale Simon')
          > res.result.indexOf('Ben Matthews'),
          'Ben followed by Gale (first name)');
        t.ok(res.result.indexOf('Sally Robbins')
          > res.result.indexOf('Gale Simon'),
          'Gale followed by Sally (first name)');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
