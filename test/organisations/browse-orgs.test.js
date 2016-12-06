'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];
var adFiltered, prFiltered, filterRegex;
var filterTag = {
  id: 69,
  name: 'Design for disassembly'
};

var browseAll = function (cookie, filter) {

  return {
    method: 'GET',
    url: filter ? '/orgs?tags=' + filter : '/orgs',
    headers: { cookie: 'token=' + cookie }
  };
};

// fail to access /challenges IF NOT LOGGED IN
tape('/orgs endpoint unsuccessful when not logged in',
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

// /orgs route accessible by admin
tape('access all active&inactive orgs as a logged-in admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(adminToken), function (res) {
        var expected = [
          'Apple AAAA',
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

// /orgs route accessible by admin
tape('access all active orgs as a logged-in primary', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(primaryToken), function (res) {
        var expected = [
          'Apple AAAA',
          // 'Asda', >> INACTIVE org
          'Charcoal',
          // 'Coca Cola', >> INACTIVE org
          'Co-op Group',
          'dwyl',
          'EMF',
          // 'Fanta', >> INACTIVE org
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

// orgs are filtered correctly
tape('access /orgs?tags=' + filterTag.id + ' as a logged-in admin',
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
