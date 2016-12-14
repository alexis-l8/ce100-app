'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];

var adminId = 1;
var authId = 3;
var unauthId = 6;
var update = {
  first_name: 'Sally',
  last_name: 'Robertson',
  job_title: 'Chocolatier',
  phone: '07111111111'
};

function editProfile (token, id, update) {
  return {
    method: update ? 'POST' : 'GET',
    url: '/people/' + id + '/edit',
    headers: { cookie: 'token=' + token },
    payload: !update ? undefined : update
  };
}

function viewOrgProfile (token) {
  return {
    url: '/orgs/{id}',
    headers: { cookie: 'token=' + token },
  };
}

tape('/people/{id}/edit GET endpoint for unauthed user',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(null, authId, null), function (res) {
          t.equal(res.statusCode, 401, 'unauthed user: no access');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/people/{id}/edit GET own endpoint as admin',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(adminToken, adminId, null), function (adminRes) {
          t.equal(adminRes.statusCode, 200, 'admin authorised to access view');
          t.ok(adminRes.payload.indexOf('Alex') > -1, 'correct fname displayed');
          t.ok(adminRes.payload.indexOf('Wijns') > -1, 'correct lname displayed');
          t.ok(adminRes.payload.indexOf('>ce100.emf@gmail.com</span>') === -1, 'email edittable because admin');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/people/{id}/edit GET different primary user\'s settings endpoints as admin',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(adminToken, authId, null), function (authRes) {
          t.equal(authRes.statusCode, 200, 'admin authorised to access view');
          t.ok(authRes.payload.indexOf('Sally') > -1, 'correct fname displayed');
          t.ok(authRes.payload.indexOf('Robbins') > -1, 'correct lname displayed');
          t.ok(authRes.payload.indexOf('>sa@ro.co</span>') === -1, 'email edittable because admin');
          server.inject(editProfile(adminToken, unauthId, null), function (unauthRes) {
            t.equal(unauthRes.statusCode, 200, 'admin authorised to access settings view of any user');
            t.ok(unauthRes.payload.indexOf('Gale') > -1, 'correct fname displayed');
            t.ok(unauthRes.payload.indexOf('Simon') > -1, 'correct lname displayed');
            t.ok(unauthRes.payload.indexOf('>ga@si.co</span>') === -1, 'email edittable because admin');
            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });
  });

tape('/people/{id}/edit GET endpoint of primary user X as primary user Y',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(primaryToken, unauthId, null), function (res) {
          t.equal(res.statusCode, 400, 'primary unauthorised to access settings view of another primary user');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/people/{id}/edit GET endpoint of own settings as primary user',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(primaryToken, authId, null), function (res) {
          t.equal(res.statusCode, 200, 'primary authorised to access view');
          t.ok(res.payload.indexOf('Sally') > -1, 'correct fname displayed');
          t.ok(res.payload.indexOf('Robbins') > -1, 'correct lname displayed');
          t.ok(res.payload.indexOf('>sa@ro.co</span>') > -1, 'email is _not_ edittable because primary');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/people/{id}/edit POST endpoint: update own profile',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(primaryToken, authId, update), function (res) {
          t.equal(res.statusCode, 302, 'primary authorise, profile updated');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/people/{id}/edit POST endpoint: update own profile',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(primaryToken, unauthId, update), function (res) {
          t.equal(res.statusCode, 400, 'primary unauthorised, could not update profile');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
