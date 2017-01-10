'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret).admin_1;

function add (cookie, method, payload) {
  return {
    method: method,
    url: '/insights/add',
    headers: { cookie: 'token=' + cookie },
    payload: payload
  };
}

var getAll = {
  method: 'GET',
  url: '/insights',
  headers: { cookie: 'token=' + adminToken }
};

// fail to access /insights/add IF NOT LOGGED IN
tape('/insights/add cannot be viewed unless logged in',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(add(false, 'GET', false), function (res) {
          t.equal(
            res.statusCode,
            302,
            'request an endpoint requiring auth get 302');
          t.equal(
            res.headers.location,
            '/login?redirect=/insights/add',
            'redirected to login page'
          );
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

// /insights/add route accessible by admin
tape('/insights/add: add insight as admin', function (t) {
  var insight = {
    title: 'Handbook',
    url: 'http://www.scottrao.com/Rao-Barista.pdf',
    author: 'P Diffy',
    doctype: '.pdf',
    resource: false
  };

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(add(adminToken, 'POST', insight), function (res) {
        t.equal(res.statusCode, 302, 'insight added and user is redirected');
        t.equal(res.headers.location, '/insights', 'page redirects to /insights');
        server.inject(getAll, function (res) {
          t.ok(res.result.indexOf(insight.title) > -1, 'insight title displayed on /insights');
          t.ok(res.result.indexOf(insight.url) > -1, 'insight url displayed on /insights');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});

// fail validation
tape('/insights/add: fail validation (no title)', function (t) {
  var insight = {
    url: 'http://www.scottrao.com/Rao-Barista.pdf',
    author: 'P Diffy',
    doctype: '.pdf',
    resource: false
  };

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(add(adminToken, 'POST', insight), function (res) {
        t.equal(res.statusCode, 401, 'error thrown - insight not added');
        t.ok(res.result.indexOf('title is required'), 'error message for title requirement is displayed');
        server.inject(getAll, function (res) {
          t.ok(res.result.indexOf(insight.title) === -1, 'insight title is not displayed on /insights');
          t.ok(res.result.indexOf(insight.url) === -1, 'insight url is not displayed on /insights');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});