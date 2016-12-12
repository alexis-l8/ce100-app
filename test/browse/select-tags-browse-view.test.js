var tape = require('tape');
var config = require('../../server/config.js');
var initServer = require('../../server/server.js');

var sessions = require('../helpers/add-sessions.js');



function selectTagsBrowse (user, browseType) {
  return {
    url: '/' + browseType + '/tags',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] },

  };
}

// CHECK THAT ADMINS CAN SEE THE CORRECT VIEW FOR SEARCHING ORGS AND CHALLENGES
// REPEAT TESTS FOR PRIMARY USER

// ADMIN
tape('Admin view select tags to browse a view orgs: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(selectTagsBrowse('admin_1', 'orgs'), function (res) {
        t.equal(res.statusCode, 200, 'Admin can see the view');
        t.ok(res.payload.indexOf('Search all tags') > -1, 'correct view is displayed');
        t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for orgs');
        t.ok(res.payload.indexOf('Corporate') > -1, 'corporate child tag in payload for orgs');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});


// test an admin successfuly adding an organisation
tape('Admin view select tags to browse a view challenges: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(selectTagsBrowse('admin_1', 'challenges'), function (res) {
        t.equal(res.statusCode, 200, 'Admin can see the view');
        t.ok(res.payload.indexOf('Search all tags') > -1, 'correct view is displayed');
        t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for orgs');
        t.ok(res.payload.indexOf('Corporate') > -1, 'corporate child tag in payload for orgs');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});


// PRIMARY USER

tape('Primary view select tags to browse a view orgs: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(selectTagsBrowse('primary_3', 'orgs'), function (res) {
        t.equal(res.statusCode, 200, 'Primary can see the view');
        t.ok(res.payload.indexOf('Search all tags') > -1, 'correct view is displayed');
        t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for orgs');
        t.ok(res.payload.indexOf('Corporate') > -1, 'corporate child tag in payload for orgs');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});


// test an admin successfuly adding an organisation
tape('Primary view select tags to browse a view challenges: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(selectTagsBrowse('primary_3', 'challenges'), function (res) {
        t.equal(res.statusCode, 200, 'Primary can see the view');
        t.ok(res.payload.indexOf('Search all tags') > -1, 'correct view is displayed');
        t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for orgs');
        t.ok(res.payload.indexOf('Corporate') > -1, 'corporate child tag in payload for orgs');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
