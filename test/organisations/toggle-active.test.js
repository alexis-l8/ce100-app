var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminCookie = { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] };
var primaryCookie = { cookie: 'token=' + sessions.tokens(config.jwt_secret)['primary_3'] };

function toggleActiveOptions (cookie, id) {
  return {
    url: '/orgs/' + id + '/toggle-active',
    headers: cookie
  };
}

function editOrgView (cookie, id) {
  return {
    url: '/orgs/' + id + '/edit',
    headers: cookie
  };
}

function userDetailsView (cookie, id) {
  return {
    url: '/people/' + id + '/edit',
    headers: cookie
  };
}

tape('Admin can disable an organisation: --> ' + __filename, function (t) {
  var oid = 1;
  var uid = 3;
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleActiveOptions(adminCookie, oid), function (res) {
        t.equal(
          res.statusCode,
          302,
          'admin is redirected after disabling an org'
        );
        server.inject(editOrgView(adminCookie, oid), function (res) {
          t.ok(
            res.payload.indexOf('Enable Organisation') > -1,
            'Organisation was successfuly disabled'
          );
          server.inject(userDetailsView(adminCookie, uid), function (res) {
            t.ok(
              res.payload.indexOf('Enable User') > -1,
              'Primary user account also disabled'
            );
            t.equal();
            t.end();
            pool.end();
            server.stop();
          });
        });
      });
    });
  });
});

tape('Admin can enable an organisation: --> ' + __filename, function (t) {
  var oid = 7; // no primary user for this org.
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleActiveOptions(adminCookie, oid), function (res) {
        t.equal(
          res.statusCode,
          302,
          'admin is redirected after disabling an org'
        );
        server.inject(editOrgView(adminCookie, oid), function (res) {
          t.ok(
            res.payload.indexOf('Disable Organisation') > -1,
            'Organisation was successfuly enabled'
          );
            t.equal();
            t.end();
            pool.end();
            server.stop();
        });
      });
    });
  });
});

tape('Primary cannot enable/disable an organisation: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleActiveOptions(primaryCookie, 1), function (res) {
        t.equal(
          res.statusCode,
          403,
          'Primary cannot access /orgs/{id}/toggle-active endpoint'
        );
        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
