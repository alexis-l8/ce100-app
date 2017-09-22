'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var people = require('ce100-mock-data').people;

var activeOnly = people.filter(function (userObj) {
  return userObj.active
    && userObj.user_type !== 'admin'
    && userObj.account_activated;
});

var nonAdminUsers = ['primary_3', 'secondary_12'];

var browseAll = function (user) {
  return {
    method: 'GET',
    url: '/people',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
};

// fail to access /people IF NOT LOGGED IN
tape('/people endpoint unsuccessful when not logged in',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(browseAll(), function (res) {
          t.equal(res.statusCode, 302, 'request an endpoint requiring auth get 302');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

// /people route displays all active and inactive users to admins
tape('check all active + inactive users displayed', function (t) {

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


nonAdminUsers.forEach(function (user) {
  var userType = user.split('_')[0];

  // /people route displays all active users to primary/secondary
  tape('check only active users displayed', function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'no initialising error');
        server.inject(browseAll(user), function (res) {
          t.equal(res.statusCode, 200, 'route accessible to ' + userType);
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});

tape('/people quick contact list page loads for primary user', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(browseAll('primary_3'), function (res) {
        t.equal(res.statusCode, 200, 'route exists and replies 200');
        t.ok(res.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
        t.equal(res.payload.indexOf('Marie Kasai'), -1, 'primary user cannot view admins on quick contact list');
        t.equal(res.payload.indexOf('Frank Goldsmith'), -1, 'primary user cannot view inactive primary users on quick contact list');
        t.equal(res.payload.indexOf('/people/4/edit'), -1, 'primary user cannot see the edit button on quick contact list');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

tape('/people quick contact list page loads for admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(browseAll('admin_1'), function (res) {
        t.equal(res.statusCode, 200, 'route exists and replies 200');
        t.ok(res.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
        t.ok(res.payload.indexOf('Marie Kasai') > -1, 'admin can view admins on quick contact list');
        t.ok(res.payload.indexOf('Frank Goldsmith') > -1, 'admin can view inactive admins on quick contact list');
        t.ok(res.payload.indexOf('/people/4/edit') > -1, 'admin can see the edit button on quick contact list');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});



tape('/people quick contact list sort users correctly', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(browseAll('admin_1'), function (res) {

        var viewableUsers = res.payload.split('list__data');
        var benInstances = [];
        viewableUsers.forEach((el, i) => {
          el.indexOf('Ben M') > -1 && benInstances.push(i);
        });
        t.equal(benInstances.length, 2, 'There are two users with the same name in contact list');

        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
