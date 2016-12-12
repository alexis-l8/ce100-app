'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var admin = { cookie: 'token=' + sessions.tokens(config.jwt_secret).admin_1 };
var primary = { cookie: 'token=' + sessions.tokens(config.jwt_secret).primary_3 };
var challengeId = 1;

function editChallenge (token) {
  return {
    method: 'GET',
    url: '/challenges/' + challengeId + '/edit',
    headers: token
  };
}

function toggleActivity (token) {
  return {
    method: 'POST',
    url: '/challenges/' + challengeId + '/toggle-active',
    headers: token
  };
}

tape('Admin can enable/disable a challenge', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      if (error) { console.log(error); }

      // server.inject(editChallenge(admin), function (res) {
      //   t.ok(res.payload.indexOf('Enable Challenge') > -1, 'chal is disabled to begin with');
        server.inject(toggleActivity(admin), function (enabled) {
          console.log(enabled.result);
          // t.equal(enabled.statusCode, 404, 'admin is redirected after enabling a chal');
          t.end();
          pool.end();
          server.stop();
        });
      });
    // });
  });
});

// tape('Primary can enable/disable a challenge', function (t) {
//   sessions.addAll(function () {
//     init(config, function (error, server, pool) {
//       if (error) { console.log(error); }
//
//       server.inject(editChallenge(primary), function (res) {
//         t.ok(res.payload.indexOf('Enable Challenge') > -1, 'chal is disabled to begin with');
//         server.inject(toggleActivity(primary), function (enabled) {
//           t.equal(enabled.statusCode, 302, 'primary is redirected after enabling a chal');
//           server.inject(editChallenge(primary), function (res) {
//             t.ok(res.payload.indexOf('Disable Challenge') > -1, 'chal successfuly enabled');
//             server.inject(toggleActivity(primary), function (disabled) {
//               t.equal(disabled.statusCode, 302, 'primary is redirected after disabling a chal');
//               server.inject(editChallenge(primary), function (res) {
//                 t.ok(res.payload.indexOf('Enable Challenge') > -1, 'chal successfuly disabled');
//                 t.end();
//                 pool.end();
//                 server.stop();
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// });
