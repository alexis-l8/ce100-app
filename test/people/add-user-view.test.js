'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');


var addUser = function (user) {
  return {
    url: '/people/add',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
};


tape('orgs/add primary cannot view', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(addUser('primary_3'), function (res) {
        t.equal(res.statusCode, 403, 'primary user cannot access the add person route');

        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

tape('Correct fields in orgs/add view', function (t) {
  var userTypes = ['admin', 'primary', 'secondary'];
  var activeOrgIds = [
    { name: 'Apple', id: 1 },
    { name: 'Asda', id: 6 },
    { name: 'Charcoal', id: 3 },
    { name: 'Co-op Group', id: 5 },
    { name: 'dwyl', id: 2 },
    { name: 'EMF', id: 4 },
    { name: 'Graze', id: 9 }
  ];
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(addUser('admin_1'), function (res) {
        t.equal(res.statusCode, 200, 'admin can view the route');
        t.ok(res.payload.indexOf('First name') > -1, 'First name field is present');
        t.ok(res.payload.indexOf('Last name') > -1, 'Last name field is present');
        t.ok(res.payload.indexOf('Job title') > -1, 'Job title field is present');
        t.ok(res.payload.indexOf('Email') > -1, 'Email field is present');
        t.ok(res.payload.indexOf('Email') > -1, 'Email field is present');
        t.ok(res.payload.indexOf('Phone number') > -1, 'Phone number field is present');
        t.ok(res.payload.indexOf('Phone number') > -1, 'Phone number field is present');
        t.ok(res.payload.indexOf('User type') > -1, 'User type field is present');
        userTypes.forEach(function (radio, index) {
          var html = 'type="radio" name="user_type" value="' + radio + '"';
          t.ok(res.payload.indexOf(html), radio + ' radio is present');
          if (index === userTypes.length - 1) {
            t.ok(
              res.payload.indexOf('Organisation') > -1,
              'Organisation field is present'
            );
            activeOrgIds.forEach(function (radio, index) {
              var html = 'value="' + activeOrgIds.id + '">' + activeOrgIds.name;
              t.ok(res.payload.indexOf(html),
                activeOrgIds.name + ' organisation is present'
              );
              if (index === userTypes.length - 1) {
                t.end();
                server.stop();
                pool.end();
              }
            });
          }
        });
      });
    });
  });
});
