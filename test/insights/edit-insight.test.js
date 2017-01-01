'use strict';

var tape = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');

var adminToken = sessions.tokens(config.jwt_secret)['admin_1'];
var primaryToken = sessions.tokens(config.jwt_secret)['primary_3'];

var insightId = 1;
var viewInsights = {
  url: '/insights',
  headers: { cookie: 'token=' + adminToken }
};

function editInsight (token, id, update) {
  return {
    method: update ? 'POST' : 'GET',
    url: '/insights/' + id + '/edit',
    headers: { cookie: 'token=' + token },
    payload: update
  };
}

tape('/insights/{id}/edit GET endpoint: primary user cannot access',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editInsight(primaryToken, insightId), function (res) {
          t.equal(
            res.statusCode,
            403,
            'Primary cannot access edit-insight view'
          );
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/insights/{id}/edit GET endpoint displays prefilled forms correctly',
  function (t) {
    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editInsight(adminToken, insightId), function (res) {
          t.equal(
            res.statusCode,
            200,
            'Admin can view edit-insight view'
          );
          t.ok(res.result.indexOf('Insight Number 1') > -1, 'Insight\'s title displays correctly');
          t.ok(res.result.indexOf('https://emf-packs.s3-eu-west-1.amazonaws.com/Growth%20Within%20-%20June%202015/EllenMacArthurFoundation_Growth%20Within_for%20print.pdf?AWSAccessKeyId&#x3D;AKIAITAQSOURJ2COPP2A&amp;Signature&#x3D;exc0fbGigjcG88LlqNibztPX%2F3k%3D&amp;Expires&#x3D;1498468767') > -1, 'Insight\'s url displays correctly');
          t.ok(res.result.indexOf('Kamala Khan') > -1, 'Insight\'s author displays correctly');
          t.ok(res.result.indexOf('.pdf') > -1, 'Insight\'s filetype displays correctly');
          t.end();
          server.stop();
          pool.end();
        });
      });
    });
  });

tape('/insights/{id}/edit POST endpoint, admin can update existing info',
  function (t) {
    var insight = {
      title: 'Renewables Report (2015)',
      url: 'http://www.ren21.net/wp-content/uploads/2015/07/REN12-GSR2015_Onlinebook_low1.pdf',
      author: 'REN21',
      doctype: '.pdf',
      resource: true
    };

    sessions.addAll(function () {
      init(config, function (error, server, pool) {
        t.ok(!error, 'No error on init server');
        server.inject(editInsight(adminToken, insightId, insight), function (res) {
          t.equal(
            res.statusCode,
            302,
            'Admin has successfully updated existing insight and is now being redirected'
          );
          t.equal(
            res.headers.location,
            '/insights/' + insightId + '/tags',
            'Admin is redirected to /insights as expected'
          );
          server.inject(viewInsights, function (res) {
            t.ok(res.result.indexOf('Renewables Report (2015)') > -1, 'Insight\'s title displays correctly');
            t.ok(res.result.indexOf('http://www.ren21.net/wp-content/uploads/2015/07/REN12-GSR2015_Onlinebook_low1.pdf') > -1, 'Insight\'s url displays correctly');
            t.ok(res.result.indexOf('.pdf') > -1, 'Insight\'s filetype displays correctly');
            t.end();
            server.stop();
            pool.end();
          });
        });
      });
    });
  });
