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
    url: filter ? '/orgs?tags=' + filter : '/orgs',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
};

// fail to access /orgs IF NOT LOGGED IN
tape('/orgs endpoint unsuccessful when not logged in', function (t) {
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

// /orgs route accessible by admin
tape('access all active&inactive orgs as a logged-in admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll('admin_1'), function (res) {
        var expected = [
          'Apple',
          'Asda',
          'Charcoal',
          'Coca Cola',
          'Co-op Group',
          'dwyl',
          'EMF',
          'Fanta',
        ];

        t.equal(res.statusCode, 200, 'route accessible to admin');
        expected.forEach(function(org, index) {
          var regexp = new RegExp(org, 'g');
          t.ok(res.result.match(regexp), 'org name ' + org + ' appears as expected');
          if (index === expected.length - 1) {
            t.end();
            server.stop();
            pool.end();
          }
        });
      });
    });
  });
});


var users = ['primary_3', 'secondary_12'];
// /orgs route accessible by primary and secondary
users.forEach(function (user) {
  var userType = user.split('_')[0];

  tape('access all active orgs as a ' + userType + ': --> ' + __filename, function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'no initialising error');
        server.inject(browseAll(user), function (res) {
          var expected = [
            'Apple',
            'Charcoal',
            'Co-op Group',
            'dwyl',
            'EMF',
          ];

          t.equal(res.statusCode, 200, 'route accessible');

          // check disabled orgs do not show up
          t.ok(res.payload.indexOf('Fanta') === -1, 'Disabled orgs do not show up for ' + userType + ' users');
          t.ok(res.payload.indexOf('Coca Cola') === -1, 'Disabled orgs do not show up for ' + userType + ' users');

          // check enabled orgs do show up
          expected.forEach(function(org, index) {
            t.ok(res.payload.indexOf(org) > -1, 'org name ' + org + ' appears as expected');
            if (index === expected.length - 1) {
              t.end();
              server.stop();
              pool.end();
            }
          });
        });
      });
    });
  });
})

// orgs are filtered correctly
tape('access /orgs?tags=' + filterTag.id + ' as a logged-in admin',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'no initialising error');
        server.inject(browseAll('admin_1', filterTag.id), function (adRes) {
          adFiltered = adRes.payload;
          server.inject(browseAll('primary_3', filterTag.id), function (prRes) {
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
