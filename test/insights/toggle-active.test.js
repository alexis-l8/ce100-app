var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminCookie = { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] };

function toggleActiveOptions (id) {
  return {
    url: '/insights/' + id + '/toggle-active',
    headers: adminCookie
  };
}

function editInsightView (id) {
  return {
    url: '/insights/' + id + '/edit',
    headers: adminCookie
  };
}


tape('Admin can disable an insight: --> ' + __filename, function (t) {
  var activeInsight = 1;
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      if (error) { console.log(error); }

      server.inject(toggleActiveOptions(activeInsight), function (res) {
        t.equal(res.statusCode, 302, 'admin is redirected after archiving an insight');

        server.inject(editInsightView(activeInsight), function (res) {
          t.ok(res.payload.indexOf('Unarchive Insight') > -1, 'Insight was successfuly archived');

          t.end();
          pool.end();
          server.stop();
        })
      });
    });
  });
});

tape('Admin can enable an insight: --> ' + __filename, function (t) {
  var inactiveInsight = 2;
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      server.inject(toggleActiveOptions(inactiveInsight), function (res) {
        t.equal(res.statusCode, 302, 'admin is redirected after unarchiving an insight');

        server.inject(editInsightView(inactiveInsight), function (res) {
          t.ok(res.payload.indexOf('Archive Insight') > -1, 'Insight was successfuly unarchived')
          t.end();
          pool.end();
          server.stop();
        })

      });
    });
  });
});
