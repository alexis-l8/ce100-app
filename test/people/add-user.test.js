'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');


var addUser = function (userObj) {
  return {
    method: 'POST',
    url: '/people/add',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] },
    payload: userObj
  };
};

// failing payloads
var noFirst = {first_name: ''};
var noLast = {first_name: 'Jaja', last_name: ''};
var shortPhone = {first_name: 'Jaja', last_name: 'Bink', email: 'ja@ju.co', user_type: 'primary', phone: '+442088377', job_title: 'CEO', org_id: -1};

tape('orgs/add failing validation test', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(addUser(noFirst), function (res) {
        t.equal(res.statusCode, 401, 'no first name fails validation at /people/add');
        t.ok(res.payload.indexOf('first name is not allowed to be empty') > -1, 'reply to user with following message: "first name is not allowed to be empty"');
        server.inject(addUser(noLast), function (res) {
          t.equal(res.statusCode, 401, 'no last name fails validation at /people/add');
          t.ok(res.payload.indexOf('last name is not allowed to be empty') > -1, 'reply to user with following message: "last name is not allowed to be empty"');
          server.inject(addUser(shortPhone), function (res) {
            t.equal(res.statusCode, 401, 'Too short phone number fails validation at /people/add');
            t.ok(res.payload.indexOf('phone length must be at least 11 characters long') > -1, 'reply to user with following message: "phone must be at least..."');

            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });
  });
});

// comment test out until we implement nock
// tape('orgs/add add user with no organisation', function (t) {
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//
//       var userObj = {
//         first_name: 'Jaja',
//         last_name: 'Bink',
//         email: 'jaja@gmail.com',
//         phone: '+44208837733',
//         user_type: 'primary',
//         job_title: 'CEO',
//         org_id: -1
//       };
//
//       server.inject(addUser(userObj), function (res) {
//         var expected = { org_id: null, id: 12, org_name: null };
//
//         t.deepEqual(res.result, expected, 'successful email returns with new user details');
//         t.equal(res.statusCode, 302, 'admin is redirected after successful new user');
//
//         t.end();
//         server.stop();
//         pool.end();
//
//       });
//     });
//   });
// });
