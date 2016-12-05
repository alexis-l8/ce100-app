// 'use strict';
//
// var tape = require('tape');
// var sessions = require('../helpers/add-sessions.js');
// var init = require('../../server/server.js');
// var config = require('../../server/config.js');
//
// var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
// var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];
//
// var browseAll = function (cookie) {
//   return {
//     method: 'GET',
//     url: '/people',
//     headers: { cookie: 'token=' + cookie }
//   };
// };
//
// // all people length > filtered people
//
// // fail to access /people IF NOT LOGGED IN
// tape('/people endpoint unsuccessful when not logged in',
//   function (t) {
//     sessions.addAll(function () {
//       init(config, function (error, server, pool) {
//         t.ok(!error, 'No error on init server');
//         server.inject(browseAll(), function (res) {
//           t.equal(res.statusCode, 401,
//             'request an endpoint requiring auth get 401');
//           t.end();
//           server.stop();
//           pool.end();
//         });
//       });
//     });
//   });
//
// // /people route accessible by admin
// tape('access /people as a logged-in admin', function (t) {
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//       t.ok(!error, 'no initialising error');
//       server.inject(browseAll(adminToken), function (res) {
//         t.equal(res.statusCode, 200, 'route accessible to admin');
//         t.end();
//         server.stop();
//         pool.end();
//       });
//     });
//   });
// });
//
// // /people route accessible by primary
// tape('access /people as a logged-in primary user', function (t) {
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//       t.ok(!error, 'no initialising error');
//       server.inject(browseAll(primaryToken), function (res) {
//         t.equal(res.statusCode, 200, 'route accessible to admin');
//         t.end();
//         server.stop();
//         pool.end();
//       });
//     });
//   });
// });
