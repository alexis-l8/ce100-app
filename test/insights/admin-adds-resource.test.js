'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

function add (user, method, payload) {
  return {
    method: method,
    url: '/insights/add',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user]},
    payload: payload
  };
}

function getAll (user) {
  return {
    method: 'GET',
    url: '/resources',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}

// access /resources as admin, primary and secondary
tape('/resources accessible by all users', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(getAll('admin_1'), function (res) {
        t.equal(res.statusCode, 200, 'admin can access /resources endpoint');
        server.inject(getAll('primary_3'), function (res) {
          t.equal(res.statusCode, 200, 'primary can access /resources endpoint');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});

// admin adds insight, and marks it as a resource
tape('/insights/add: add new resource as admin', function (t) {
  var resource = {
    title: 'Renewable Energy Review 2011',
    url: 'https://www.theccc.org.uk/archive/aws/Renewables%20Review/The%20renewable%20energy%20review_Printout.pdf',
    author: 'Committee on Climate Change',
    type: 'REPORT',
    resource: true,
    active: 'on'
  };

  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(add('admin_1', 'POST', resource), function (res) {
        t.equal(res.statusCode, 302, 'resource added and user is redirected');
        // user redirected to /insights/id/tags
        t.ok(res.headers.location.indexOf('/insights') > -1, 'page redirects to /insights');
        t.ok(res.headers.location.indexOf('/tags') > -1, 'page redirects to /insights/id/tags');
        server.inject(getAll('primary_3'), function (res) {
          var resources = res.payload.split('<li class="list__item">');
          t.equal(resources.length - 1, 2, 'new resource displayed, and total number of resources is now 2');
          t.ok(res.result.indexOf(resource.title) > -1, 'resource title displayed on /resources');
          t.ok(res.result.indexOf(resource.url) > -1, 'resource url displayed on /resources');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});
