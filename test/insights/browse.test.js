'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');


function browseAll (user, filterTag) {
  return {
    method: 'GET',
    url: filterTag ? '/insights?tags=' + filterTag : '/insights',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}

// fail to access /insights IF NOT LOGGED IN
tape('/insights endpoint unsuccessful when not logged in',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(browseAll(), function (res) {
          t.equal(
            res.statusCode,
            302,
            'request an endpoint requiring auth get 302');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

// /insights route accessible by admin and displays details as expected
tape('view all insights on /insights as a logged-in admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll('admin_1'), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to admin');
        t.ok(
          res.result.indexOf('Insight Number 1') > -1,
          'insight number 1 - title displayed'
        );
        t.ok(
          res.result.indexOf('https://emf-packs.s3-eu-west-1.amazonaws.com/Growth%20Within%20-%20June%202015/EllenMacArthurFoundation_Growth%20Within_for%20print.pdf?AWSAccessKeyId&#x3D;AKIAITAQSOURJ2COPP2A&amp;Signature&#x3D;exc0fbGigjcG88LlqNibztPX%2F3k%3D&amp;Expires&#x3D;1498468767') > -1,
          'insight number 1 - url displayed'
        );
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});


// /insights displays active and inactive insights to admin
tape('/insight displays inactive (and active) insights to admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll('admin_1'), function (res) {
        t.ok(
          res.result.indexOf('Insight Number 2') > -1,
          'insight number 2 - title displayed'
        );
        t.ok(
          res.result.indexOf('https://encrypted-tbn3.gstatic.com/images?q&#x3D;tbn:ANd9GcS8nGH7cyac0GS8IWPiGSwWeliasSRM_X7NWYh_MyxMEicGYYrc') > -1,
          'insight number 2 - url displayed'
        );
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});

var nonAdminUsers = ['primary_3', 'secondary_12'];

nonAdminUsers.forEach(function (user) {
  var userType = user.split('_');

  // /insights route accessible by primary/secondary
  tape('view all active insights on /insights as a logged-in ' + userType + ': --> ' + __filename, function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'no initialising error');
        server.inject(browseAll(user), function (res) {
          t.equal(res.statusCode, 200, 'route accessible to ' + userType);

          // active insights show up
          t.ok( res.result.indexOf('Insight Number 1') > -1, 'insight number 1 - title displayed' );
          t.ok(
            res.result.indexOf('https://emf-packs.s3-eu-west-1.amazonaws.com/Growth%20Within%20-%20June%202015/EllenMacArthurFoundation_Growth%20Within_for%20print.pdf?AWSAccessKeyId&#x3D;AKIAITAQSOURJ2COPP2A&amp;Signature&#x3D;exc0fbGigjcG88LlqNibztPX%2F3k%3D&amp;Expires&#x3D;1498468767') > -1,
            'insight number 1 - url displayed'
          );

          // Inactive insights do not show up
          t.ok(res.result.indexOf('Insight Number 2') === -1, 'insight number 2 - title is not displayed');
          t.ok(
            res.result.indexOf('https://encrypted-tbn3.gstatic.com/images?q&#x3D;tbn:ANd9GcS8nGH7cyac0GS8IWPiGSwWeliasSRM_X7NWYh_MyxMEicGYYrc') === -1,
            'insight number 2 - url is not displayed'
          );
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });
});


// insights are filtered correctly for admin
tape('access /insights?tags=filterTagId as a logged-in admin', function (t) {
  var filterTagId = 22;
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll('admin_1', filterTagId), function (res) {
        t.ok( res.result.indexOf('Insight Number 1') > -1, 'insight number 1 - title is displayed' );
        t.ok( res.result.indexOf('Insight Number 2') === -1, 'insight number 2 - title is not displayed' );
        t.ok( res.result.indexOf('Insight Number 3') === -1, 'insight number 3 - title is not displayed' );
        t.end();
        server.stop();
        pool.end();
      });
    });
  });
});
