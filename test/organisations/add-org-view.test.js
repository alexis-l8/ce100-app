var tape = require('tape');
var config = require('../../server/config.js');
var initServer = require('../../server/server.js');

var sessions = require('../helpers/add-sessions.js');

// use this function to build requests to view different organisation details with different user types
function addOrgView (user) {
  return {
    method: 'GET',
    url: '/orgs/add',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user || 'admin_1'] }
  };
}

// test admin view
tape('Admin can view /orgs/add: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addOrgView(), function (res) {
        t.equal(res.statusCode, 200, 'Route accessible to admin');
        server.inject(addOrgView('primary_3'), function (res) {
          t.equal(res.statusCode, 403, 'Route inaccessible to primary');
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

// check /orgs/add displays 'Org Name' and 'Org Logo' fields
tape('Correct fields displayed on /orgs/add: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addOrgView(), function (res) {
        t.equal(res.payload.split('form__section').length - 1, 2, 'Expected number of fields in the form');
        t,ok(res.payload.indexOf('Organisation Name'), 'Field for Org Name exists');
        t.ok(res.payload.indexOf('Organisation Logo'), 'Field for Org Logo exists');
        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
