var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminCookie = { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] };

function toggleActiveOptions (id) {
  return {
    url: '/orgs/' + id + '/toggle-active',
    headers: adminCookie
  };
}
function editOrgView (id) {
  return {
    url: '/orgs/' + id + '/edit',
    headers: adminCookie
  };
}


tape('Admin can disable an organisation: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleActiveOptions(1), function (res) {
        t.equal(res.statusCode, 302, 'admin is redirected after disabling an org');

        server.inject(editOrgView(1), function (res) {
          // org should now be disabled so the admin will be able to see the 'Enable Organisation' button
          t.ok(res.payload.indexOf('Enable Organisation') > -1, 'Organisation was successfuly disabled');

          t.end();
          pool.end();
          server.stop();
        })
      });
    });
  });
});

tape('Admin can enable an organisation: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(toggleActiveOptions(7), function (res) {
        t.equal(res.statusCode, 302, 'admin is redirected after enabling an org');

        server.inject(editOrgView(7), function (res) {
          t.ok(res.payload.indexOf('Disable Organisation') > -1, 'Organisation was successfuly enabled')
          t.end();
          pool.end();
          server.stop();
        })

      });
    });
  });
});
