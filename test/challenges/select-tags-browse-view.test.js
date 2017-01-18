'use strict';

var test = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

function addTagsBrowseChallenges (user) {
  return {
    method: 'GET',
    url: '/challenges/tags',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  }
}


var users = ['admin_1', 'primary_3', 'secondary_12'];

users.forEach(function (user) {
  var userType = user.split('_')[0];

  test('/challenges/tags (GET) - All active tags displayed for ' + userType + ' users: --> ' + __filename, function (t) {
    sessions.addAll(function () {
      init(config, function (err, server, pool) {
        t.ok(!err, 'no error starting server: ' + err)
        server.inject(addTagsBrowseChallenges(user), function (res) {
          var unexpected = 'Please Login to view that page';
          var expLink = 'href="/challenges?tags=124"';
          var expTag = 'Telecommunications';
          t.equal(res.statusCode, 200, userType + ' can view all active tags');
          t.equal(res.result.indexOf(unexpected), -1, 'page does not ask you to log in to view the page');
          t.ok(res.result.indexOf('BIOLOGICAL CYCLE') > -1, 'category exists');
          t.ok(res.payload.indexOf(expTag) > -1, 'tag correctly displayed');
          t.ok(res.payload.indexOf(expLink) > -1, 'link to tag correctly displayed');
          
          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});
