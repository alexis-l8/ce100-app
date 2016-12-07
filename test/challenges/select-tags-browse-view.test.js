'use strict';

var test = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');
var adminToken = sessions.tokens(config.jwt_secret).admin_1;
var primaryToken = sessions.tokens(config.jwt_secret).primary_3;

test('All active tags displayed', function (t) {
  sessions.addAll(function () {
    init(config, function (err, server, pool) {
      if (err) {
        console.log('error initialise server', err); // eslint-disable-line

        return t.fail();
      }

      server.inject({
        method: 'GET',
        url: '/challenges/tags',
        headers: { cookie: 'token=' + adminToken }
      }, function (res) {
        var unexpected = 'Please Login to view that page';
        var expLink = 'href="/challenges?tags=124"';
        var expTag = 'Telecommunications';
        t.equal(res.statusCode, 200, 'primary can view all active tags');
        t.equal(res.result.indexOf(unexpected), -1,
          'page does not ask you to log in to view the page');
        t.ok(res.result.indexOf('BIOLOGICAL CYCLE') > -1, 'category exists');
        t.ok(res.payload.indexOf(expTag) > -1,
          'tag correctly displayed');
        t.ok(res.payload.indexOf(expLink) > -1,
          'link to tag correctly displayed');
        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});

test('All active tags displayed', function (t) {
  sessions.addAll(function () {
    init(config, function (err, server, pool) {
      if (err) {
        console.log('error initialise server', err); // eslint-disable-line

        return t.fail();
      }

      server.inject({
        method: 'GET',
        url: '/challenges/tags',
        headers: { cookie: 'token=' + primaryToken }
      }, function (res) {
        var unexpected = 'Please Login to view that page';
        var expLink = 'href="/challenges?tags=124"';
        var expTag = 'Telecommunications';
        t.equal(res.statusCode, 200, 'primary can view all active tags');
        t.equal(res.result.indexOf(unexpected), -1,
          'page does not ask you to log in to view the page');
        t.ok(res.result.indexOf('BIOLOGICAL CYCLE') > -1, 'category exists');
        t.ok(res.payload.indexOf(expTag) > -1,
          'tag correctly displayed');
        t.ok(res.payload.indexOf(expLink) > -1,
          'link to tag correctly displayed');
        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
