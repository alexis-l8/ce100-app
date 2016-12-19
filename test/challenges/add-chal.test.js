'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');
var challenges = require('ce100-mock-data').challenges;

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];

function addChal (token, chal) {
  return {
    method: chal ? 'POST' : 'GET',
    url: '/challenges/add',
    headers: { cookie: 'token=' + token },
    payload: !chal ? undefined : chal
  };
}

// switch out to viewChal (id) when we create challenge details view
function viewChals (token) {
  return {
    url: '/challenges',
    headers: { cookie: 'token=' + token },
  };
}

tape('/challenges/add GET endpoint unsuccessful when not logged in',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(addChal(), function (res) {
          t.equal(
            res.headers.location,
            '/login?redirect=/challenges/add',
            'redirect to the login page'
          );
          t.equal(
            res.statusCode,
            302,
            'request an endpoint requiring auth get 302'
          );
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('admin cannot add a challenge', function (t) {
  var chal = {
    title: 'Where can I source adamantium?',
    description: 'I want to be as strong as Wolverine!'
  };

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(addChal(adminToken), function (res) {
        t.equal(res.statusCode, 403, 'Admin cannot view add challenge view');
        server.inject(addChal(adminToken, chal), function (res) {
          t.equal(res.statusCode, 403, 'Admin unauthorised to post a challenge');
          server.inject(viewChals(adminToken), function (res) {
            t.ok(res.result.indexOf(chal.title) === -1, 'Challenge not added to database, thus not displayed');
            t.end();
            pool.end();
            server.stop();
          });
        });
      });
    });
  });
});

tape('primary can add a challenge', function (t) {
  var chalId = challenges.length + 1;
  var chal = {
    title: 'Where can I source adamantium?',
    description: 'I want to be as strong as Wolverine!'
  };

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(addChal(primaryToken), function (res) {
        t.equal(res.statusCode, 200, 'Primary can view add challenge view');
        server.inject(addChal(primaryToken, chal), function (res) {
          t.equal(res.statusCode, 302, 'Primary authorised to post a challenge');
          t.equal(res.headers.location, '/challenges/' + chalId + '/tags', 'Primary redirected to add tags to chal');
          server.inject(viewChals(primaryToken), function (res) {
            t.ok(res.result.indexOf(chal.title) > -1, 'Challenge added to database, thus displayed');
            t.end();
            pool.end();
            server.stop();
          });
        });
      });
    });
  });
});
