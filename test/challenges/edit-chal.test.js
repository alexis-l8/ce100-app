'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');
var challenges = require('../../data/challenges.json');

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];

function editChal (token, id, update) {
  return {
    method: update ? 'POST' : 'GET',
    url: '/challenges/' + id + '/edit',
    headers: { cookie: 'token=' + token },
    payload: !update ? undefined : update
  };
}

// switch out to viewChal (id) when we create challenge details view
function viewChals (token) {
  return {
    url: '/challenges',
    headers: { cookie: 'token=' + token },
  };
}

tape('check /challenges/{id}/edit GET endpoint access',
  function (t) {
    var chalId = 2;
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(), function (res) {
          t.equal(res.statusCode, 401,
            'request an endpoint requiring auth get 401');
          server.inject(editChal(adminToken, chalId), function (res) {
            t.equal(res.statusCode, 200, 'Admin can view edit challenge view');
            server.inject(editChal(primaryToken, chalId), function (res) {
              t.equal(res.statusCode, 200, 'Primary can view edit challenge view');
              t.end();
              server.stop();
              pool.end();
            });
          });
        });
      });
    });
  });

tape('/challenges/{id}/edit GET endpoint displays prefilled forms correctly for admin',
  function (t) {
    var chalId = 2;
    var unauthChalId = 6;
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(adminToken, chalId), function (res) {
          t.equal(res.statusCode, 200, 'Admin can view edit challenge view');
          t.ok(res.result.indexOf('Challenge Number 2') > -1, 'active challenge title displays correctly for admin');
          t.ok(res.result.indexOf('How can I...?') > -1, 'active challenge description displays correctly for admin');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

  tape('/challenges/{id}/edit GET endpoint displays prefilled forms correctly for primary users',
    function (t) {
      var chalId = 2;
      var unauthChalId = 6;
      sessions.addAll(function () {
        init(config, function (error, server, pool) {
          t.ok(!error, 'No error on init server');
          server.inject(editChal(primaryToken, chalId), function (res) {
            t.equal(res.statusCode, 200, 'Primary can view edit challenge view');
            t.ok(res.result.indexOf('Challenge Number 2') > -1, 'active challenge title displays correctly for admin');
            t.ok(res.result.indexOf('How can I...?') > -1, 'active challenge description displays correctly for admin');
            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });

tape('/challenges/{id}/edit GET endpoint -will not- display prefilled form to primary users of a different org',
  function (t) {
    var chalId = 2;
    var unauthChalId = 6;
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(primaryToken, unauthChalId), function (res) {
          t.equal(res.statusCode, 401, 'Primary cannot view edit challenge view');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/challenges/{id}/edit POST endpoint, admin can update existing info',
  function (t) {
    var chalId = 2;
    var updatedChal = {
      title: 'A more specific Challenge Number 2',
      description: 'I have looked into the possibilities of xyz and wonder whether...'
    };
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(adminToken, chalId, updatedChal), function (res) {
          t.equal(res.statusCode, 302, 'Admin can update existing challenge');
          t.equal(res.headers.location, '/challenges/' + chalId + '/tags', 'Admin redirected to add tags view');
          server.inject(viewChals(adminToken, chalId, updatedChal), function (res) {
            // THESE TESTS WILL FAIL WHILE PR#387 IS STILL OPEN
            t.ok(res.result.indexOf(updatedChal.title) > -1, 'active challenge title correctly updated');
            t.ok(res.result.indexOf(updatedChal.description) > -1, 'active challenge description correctly updated');
            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });
  });


tape('/challenges/{id}/edit POST endpoint, primary user can update existing info',
  function (t) {
    var chalId = 2;
    var updatedChal = {
      title: 'A more specific Challenge Number 2',
      description: 'I have looked into the possibilities of xyz and wonder whether...'
    };
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(primaryToken, chalId, updatedChal), function (res) {
          t.equal(res.statusCode, 302, 'Primary can view edit challenge view');
          t.equal(res.headers.location, '/challenges/' + chalId + '/tags', 'Admin redirected to add tags view');
          server.inject(viewChals(primaryToken, chalId, updatedChal), function (res) {
            // THESE TESTS WILL FAIL WHILE PR#387 IS STILL OPEN
            t.ok(res.result.indexOf(updatedChal.title) > -1, 'active challenge title correctly updated');
            t.ok(res.result.indexOf(updatedChal.description) > -1, 'active challenge description correctly updated');
            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });
  });
