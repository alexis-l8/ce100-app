'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret).admin_1;
var primaryToken = sessions.tokens(config.jwt_secret).primary_3;
var users = require('ce100-mock-data').people;

function activeOnly () {
  return users.filter(function (userObj) {
    return userObj.active === true && userObj.user_type !== 'admin';
  });
}

var browseAll = function (cookie) {
  return {
    method: 'GET',
    url: '/people',
    headers: { cookie: 'token=' + cookie }
  };
};
//
// // fail to access /people IF NOT LOGGED IN
// tape('/people endpoint unsuccessful when not logged in',
//   function (t) {
//     sessions.addAll(function () {
//       init(config, function (error, server, pool) {
//         t.ok(!error, 'No error on init server');
//         server.inject(browseAll(), function (res) {
//           t.equal(
//             res.statusCode,
//             302,
//             'request an endpoint requiring auth get 302');
//           t.end();
//           server.stop();
//           pool.end();
//         });
//       });
//     });
//   });
//
// // /people route displays all active and inactive users to admins
// tape('check all active + inactive users displayed', function (t) {
//   var userIdentifier = '<span class="list__data list__data--primary">';
//   var regex = new RegExp(userIdentifier, 'g');
//
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//       t.ok(!error, 'no initialising error');
//       server.inject(browseAll(adminToken), function (res) {
//         t.equal(res.statusCode, 200, 'route accessible to admin');
//         t.equal(res.payload.match(regex).length, users.length, 'all users displayed');
//         t.end();
//         server.stop();
//         pool.end();
//       });
//     });
//   });
// });
//
// // /people route displays all active users to primary
// tape('check only active users displayed', function (t) {
//   var userIdentifier = '<span class="list__data list__data--primary">';
//   var regex = new RegExp(userIdentifier, 'g');
//
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//       t.ok(!error, 'no initialising error');
//       server.inject(browseAll(primaryToken), function (res) {
//         t.equal(res.statusCode, 200, 'route accessible to primary');
//         t.equal(res.payload.match(regex).length, activeOnly().length, 'active users displayed');
//         t.end();
//         server.stop();
//         pool.end();
//       });
//     });
//   });
// });
//
//
//
// tape('/people quick contact list page loads for primary user', function (t) {
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//       server.inject(browseAll(primaryToken), function (res) {
//         t.equal(res.statusCode, 200, 'route exists and replies 200');
//         t.ok(res.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
//         t.equal(res.payload.indexOf('Marie Kasai'), -1, 'primary user cannot view admins on quick contact list');
//         t.equal(res.payload.indexOf('Frank Goldsmith'), -1, 'primary user cannot view inactive primary users on quick contact list');
//         t.equal(res.payload.indexOf('/people/4/edit'), -1, 'primary user cannot see the edit button on quick contact list');
//         t.end();
//         server.stop();
//         pool.end();
//       });
//     });
//   });
// });
//
// tape('/people quick contact list page loads for admin', function (t) {
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//       server.inject(browseAll(adminToken), function (res) {
//         t.equal(res.statusCode, 200, 'route exists and replies 200');
//         t.ok(res.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
//         t.ok(res.payload.indexOf('Marie Kasai') > -1, 'admin can view admins on quick contact list');
//         t.ok(res.payload.indexOf('Frank Goldsmith') > -1, 'admin can view inactive admins on quick contact list');
//         t.ok(res.payload.indexOf('/people/4/edit') > -1, 'admin can see the edit button on quick contact list');
//         t.end();
//         server.stop();
//         pool.end();
//       });
//     });
//   });
// });
//
//
//
tape('/people quick contact list sort users correctly', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      server.inject(browseAll(adminToken), function (res) {
        var viewableUsers = res.payload.split('list__data--primary');
        var benInstances = [];
        viewableUsers.forEach((el, i) => {
          el.indexOf('Ben M') > -1 && benInstances.push(i);
        });
        t.equal(benInstances.length, 2, 'There are two users with the same name in contact list');
        t.equal(benInstances[0] + 1, benInstances[1], 'The users called Ben are listed together, sorting alphabetically worked');

        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
