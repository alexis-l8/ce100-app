'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');
var people = require('ce100-mock-data').people;

var adminId = 1;
var authId = 3;
var unauthId = 6;
var update = {
  first_name: 'Sally',
  last_name: 'Robertson',
  job_title: 'Chocolatier',
  phone: '07111111111'
};
var adminUpdate = {
  first_name: 'Alex',
  last_name: 'Snitchel',
  job_title: 'CEO',
  email: 'emf.ce100@gmail.com',
  phone: '',
  org_id: -1,
  user_type: 'admin'
};

function editProfile (user, id, update) {
  return {
    method: update ? 'POST' : 'GET',
    url: '/people/' + id + '/edit',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] },
    payload: !update ? undefined : update
  };
}


tape('/people/{id}/edit (GET) endpoint for unauthed user: --> ' + __filename, function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(null, authId, null), function (res) {
          t.equal(res.statusCode, 302, 'unauthed user: no access');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/people/{id}/edit GET own endpoint as admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'No error on init server');
      server.inject(editProfile('admin_1', adminId, null), function (adminRes) {
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

tape('/people/{id}/edit GET different primary users settings endpoints as admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'No error on init server');
      server.inject(editProfile('admin_1', authId, null), function (authRes) {
        t.equal(authRes.statusCode, 200, 'admin authorised to access view');
        t.ok(authRes.payload.indexOf('Sally') > -1, 'correct fname displayed');
        t.ok(authRes.payload.indexOf('Robbins') > -1, 'correct lname displayed');
        t.ok(authRes.payload.indexOf('>sa@ro.co</span>') === -1, 'email edittable because admin');
        server.inject(editProfile('admin_1', unauthId, null), function (unauthRes) {
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

// POST endpoints: Admin editing their details
tape('/people/{id}/edit POST endpoint: admin edit profile', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'No error on init server');
      server.inject(editProfile('admin_1', 1, adminUpdate), function (res) {
        t.equal(res.statusCode, 302, 'admin authorised, profile updated');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

tape('/people/{id}/edit POST endpoint: admin fail validation', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'No error on init server');
      var failAuth = Object.assign({}, adminUpdate, {email: ''});

      server.inject(editProfile('admin_1', 1, failAuth), function (res) {
        t.equal(res.statusCode, 401, 'admin fails validation correct status code');
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});


// non admin user settings tests
var nonAdminUsers = ['primary_3', 'secondary_12'];

nonAdminUsers.forEach(function (user) {
  var userType = user.split('_')[0];
  var userId = user.split('_')[1];
  var userObj = people[userId - 1];

  tape('/people/{id}/edit GET endpoint of primary user X as ' + userType + ' user Y', function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(user, unauthId), function (res) {
          t.equal(res.statusCode, 403, 'unauthorised to access settings view of another primary user');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

  tape('/people/{id}/edit GET endpoint of own settings as ' + userType + ' user: --> ' + __filename, function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(user, userId), function (res) {
          t.equal(res.statusCode, 200, userType + ' authorised to access view');
          t.ok(res.payload.indexOf(userObj.first_name) > -1, 'correct fname displayed');
          t.ok(res.payload.indexOf(userObj.last_name) > -1, 'correct lname displayed');
          t.ok(res.payload.indexOf('>' + userObj.email + '</span>') > -1, 'email is not edittable because not admin');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

  tape('/people/{id}/edit POST endpoint: update own profile', function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(user, userId, update), function (res) {
          t.equal(res.statusCode, 302, userType + ' authorise, profile updated');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

  tape('/people/{id}/edit POST endpoint: update a different users profile', function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editProfile(user, unauthId, update), function (res) {
          t.equal(res.statusCode, 403, userType + ' unauthorised, could not update profile');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});
