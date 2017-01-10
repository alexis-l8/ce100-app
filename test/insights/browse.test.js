'use strict';

var tape = require('tape');
var sessions = require('../helpers/add-sessions.js');
var init = require('../../server/server.js');
var config = require('../../server/config.js');

var adminToken = sessions.tokens(config.jwt_secret).admin_1;
var primaryToken = sessions.tokens(config.jwt_secret).primary_3;

// tag names and tag ids of active insight - insight 1
var tagNames = ['Agriculture', 'Global Partner', 'Telecommunications'];
var tagId = [1, 8, 22];

function browseAll (cookie, filterTag) {
  return {
    method: 'GET',
    url: filterTag ? '/insights?tags=' + filterTag : '/insights',
    headers: { cookie: 'token=' + cookie }
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
      server.inject(browseAll(adminToken), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to admin');
        t.ok(
          res.result.indexOf('Insight Number 1') > -1,
          'insight number 1 - title displayed'
        );
        t.ok(
          res.result.indexOf('https://emf-packs.s3-eu-west-1.amazonaws.com/Growth%20Within%20-%20June%202015/EllenMacArthurFoundation_Growth%20Within_for%20print.pdf?AWSAccessKeyId&#x3D;AKIAITAQSOURJ2COPP2A&amp;Signature&#x3D;exc0fbGigjcG88LlqNibztPX%2F3k%3D&amp;Expires&#x3D;1498468767') > -1,
          'insight number 1 - url displayed'
        );
        t.ok(
          res.result.indexOf('Agriculture') > -1,
          'insight number 1 - tag link displayed'
        );
        tagNames.forEach(function (name, index) {
          var id = tagId[index];
          t.ok(
            res.result.indexOf(name) > -1,
            'insight number 1 - tag name displayed'
          );
          t.ok(
            res.result.indexOf('/insights?tags=' + id) > -1,
            'insight number 1 - tag link displayed'
          );
          if (index === tagNames.length - 1) {
            t.end();
            server.stop();
            pool.end();
          }
        });
      });
    });
  });
});

// /insights route accessible by primary
tape('view all active insights on /insights as a logged-in primary', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(primaryToken), function (res) {
        t.equal(res.statusCode, 200, 'route accessible to primary');
        t.ok(
          res.result.indexOf('Insight Number 1') > -1,
          'insight number 1 - title displayed'
        );
        t.ok(
          res.result.indexOf('https://emf-packs.s3-eu-west-1.amazonaws.com/Growth%20Within%20-%20June%202015/EllenMacArthurFoundation_Growth%20Within_for%20print.pdf?AWSAccessKeyId&#x3D;AKIAITAQSOURJ2COPP2A&amp;Signature&#x3D;exc0fbGigjcG88LlqNibztPX%2F3k%3D&amp;Expires&#x3D;1498468767') > -1,
          'insight number 1 - url displayed'
        );
        t.ok(
          res.result.indexOf('Agriculture') > -1,
          'insight number 1 - tag link displayed'
        );
        tagNames.forEach(function (name, index) {
          var id = tagId[index];
          t.ok(
            res.result.indexOf(name) > -1,
            'insight number 1 - tag name displayed'
          );
          t.ok(
            res.result.indexOf('/insights?tags=' + id) > -1,
            'insight number 1 - tag link displayed'
          );
          if (index === tagNames.length - 1) {
            t.end();
            server.stop();
            pool.end();
          }
        });
      });
    });
  });
});

// /insights displays active and inactive insights to admin
tape('/insight displays inactive (and active) insights to admin', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(adminToken), function (res) {
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

// /insights displays active insights only to primary
tape('/insight displays only active insights to primary', function (t) {
  sessions.addAll(function () {
    init(config, function (error, server, pool) {
      t.ok(!error, 'no initialising error');
      server.inject(browseAll(primaryToken), function (res) {
        t.ok(
          res.result.indexOf('Insight Number 2') === -1,
          'insight number 2 - title is not displayed'
        );
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

// insights are filtered correctly for admin
tape('access /insights?tags=filterTagId as a logged-in admin',
  function (t) {
    var filterTagId = 22;
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'no initialising error');
        server.inject(browseAll(adminToken, filterTagId), function (res) {
          t.ok(
            res.result.indexOf('Insight Number 1') > -1,
            'insight number 1 - title is displayed'
          );
          t.ok(
            res.result.indexOf('Insight Number 2') === -1,
            'insight number 2 - title is not displayed'
          );
          t.ok(
            res.result.indexOf('Insight Number 3') === -1,
            'insight number 3 - title is not displayed'
          );
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
});
