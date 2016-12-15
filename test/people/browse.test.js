'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret).admin_1;
var primaryToken = sessions.tokens(config.jwt_secret).primary_3;
var users = require('../../data/people.json');

function activeOnly () {
  return users.filter(function (userObj) {
    return userObj.active === true;
  });
}

var browseAll = function (cookie) {
  return {
    method: 'GET',
    url: '/people',
    headers: { cookie: 'token=' + cookie }
  };
};

// fail to access /people IF NOT LOGGED IN
tape('/people endpoint unsuccessful when not logged in',
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

// /people route displays all active and inactive users to admins
tape('check all active + inactive users displayed', function (t) {
  var userIdentifier = '<span class="list__data list__data--primary">';
  var regex = new RegExp(userIdentifier, 'g');

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(adminToken), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to admin');
        t.equal(res.payload.match(regex).length, users.length, 'all users displayed');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

// /people route displays all active users to primary
tape('check only active users displayed', function (t) {
  var userIdentifier = '<span class="list__data list__data--primary">';
  var regex = new RegExp(userIdentifier, 'g');

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(primaryToken), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to primary');
        t.equal(res.payload.match(regex).length, activeOnly().length, 'active users displayed');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
