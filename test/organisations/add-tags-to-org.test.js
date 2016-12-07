var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');


function addTagsToOrg (user, orgId) {
  return {
    url: '/orgs/' + orgId + '/tags',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}


tape('Admin view add tags to org view: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      // admin view org with id 1
      server.inject(addTagsToOrg('admin_1', 1), function (res) {

        // Check Category 3 is open and Tag id 27 is selected
        t.ok(res.payload.indexOf('id="3" checked="checked"') > -1, 'The third category is open');
        t.ok(res.payload.indexOf('value="27" checked="checked">') > -1, 'The correct tag is already selected');

        // Check Category 1 is open and Tag id 1 is selected
        t.ok(res.payload.indexOf('id="1" checked="checked"') > -1, 'The first category is open');
        t.ok(res.payload.indexOf('value="1" checked="checked">') > -1, 'The first tag is already selected');

        // To (ever so slightly) improve the validity of these tests,
        // check that category 2 is not open and tag 2 is not checked
        t.equal(res.payload.indexOf('id="2" checked="checked"'), -1, 'The second category is not open');
        t.equal(res.payload.indexOf('value="2" checked="checked">'), -1, 'The second tag is not selected');

        t.end();
        pool.end();
        server.stop();
      })
    });
  });
});

// Repeat of above test for primary user
tape('Primary view add tags to org view: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      // admin view org with id 1
      server.inject(addTagsToOrg('primary_3', 1), function (res) {

        t.equal(res.statusCode, 200, 'primary can see the view');

        // Check Category 3 is open and Tag id 27 is selected
        t.ok(res.payload.indexOf('id="3" checked="checked"') > -1, 'The third category is open');
        t.ok(res.payload.indexOf('value="27" checked="checked">') > -1, 'The correct tag is already selected');

        // Check Category 1 is open and Tag id 1 is selected
        t.ok(res.payload.indexOf('id="1" checked="checked"') > -1, 'The first category is open');
        t.ok(res.payload.indexOf('value="1" checked="checked">') > -1, 'The first tag is already selected');

        // To (ever so slightly) improve the validity of these tests,
        // check that category 2 is not open and tag 2 is not checked
        t.equal(res.payload.indexOf('id="2" checked="checked"'), -1, 'The second category is not open');
        t.equal(res.payload.indexOf('value="2" checked="checked">'), -1, 'The second tag is not selected');

        t.end();
        pool.end();
        server.stop();
      })
    });
  });
});

// check primary user cannot add tags to a different org
tape('Primary try to view add tags to a different org view: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(addTagsToOrg('primary_3', 2), function (res) {

        t.equal(res.statusCode, 401, 'a primary cannot add tags to an org which is not theirs')

        t.end();
        pool.end();
        server.stop();
      })
    });
  });
});
