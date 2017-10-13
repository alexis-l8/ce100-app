'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];
var chalId = 2;
var unauthChalId = 6;
var updatedChal = {
  title: 'A more specific Challenge Number 2',
  description: 'I have looked into the possibilities of xyz and wonder whether...'
};

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
    headers: { cookie: 'token=' + token }
  };
}

tape('check /challenges/{id}/edit GET endpoint access',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(null, chalId, null), function (res) {
          t.equal(
            res.statusCode,
            302,
            'request an endpoint requiring auth get 302'
          );
          server.inject(editChal(adminToken, chalId), function (res) {
            t.equal(
              res.statusCode,
              200,
              'Admin can view edit challenge view'
            );
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

  tape('/challenges/{id}/edit GET endpoint displays prefilled forms correctly for primary users',
    function (t) {
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
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(primaryToken, unauthChalId), function (res) {
          t.equal(
            res.statusCode,
            302,
            'Primary cannot view edit challenge view'
          );
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/challenges/{id}/edit POST endpoint, admin can update existing info',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(adminToken, chalId, updatedChal), function (res) {
          t.equal(
            res.statusCode,
            302,
            'Admin has permission to update existing challenge');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/challenges/{id}/edit POST endpoint, primary user can update existing info',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(primaryToken, chalId, updatedChal), function (res) {
          t.equal(res.statusCode, 302, 'Primary can view edit challenge view');
          t.equal(res.headers.location, '/challenges/' + chalId, 'Primary user redirected to the challenge card');
          server.inject(viewChals(primaryToken, chalId, updatedChal), function (res) {
            t.ok(res.result.indexOf(updatedChal.title) > -1, 'active challenge title correctly updated');
            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });
  });

tape('/challenges/{id}/edit POST endpoint, primary -cannot- update existing challenge that is not theirs',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editChal(primaryToken, unauthChalId, updatedChal), function (res) {
          t.equal(
            res.statusCode,
            302,
            'Primary cannot edit challenge of another org');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
