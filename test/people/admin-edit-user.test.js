var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');
var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

// test editing a user, leaving their linked organisation alone.

// oldOrgId = 1, newOrgId = 1.
tape('admin edits user profile but doesnt change organisation', t => {
  t.plan(5);
  var getOptions = {
    method: 'GET',
    url: '/people/3/edit',
    headers: { cookie: `token=${admin_token}` }
  };
  var postOptions = {
    method: 'POST',
    url: '/people/3/edit',
    payload: payloads.editUserPayloadOrgUnchanged,
    headers: { cookie: `token=${admin_token}` }
  };
  var viewOrg = {
    method: 'GET',
    url: '/people/3/edit',
    payload: payloads.editUserPayloadOrgUnchanged,
    headers: { cookie: `token=${admin_token}` }
  }
  server.inject(getOptions, res => {
    t.equal(res.statusCode, 200, 'route exists and replies 200');
    server.inject(postOptions, res => {
      t.equal(res.statusCode, 302, 'on updating a user, page redirects to /people/{{id}}');
      server.inject(getOptions, res => {
        t.equal(res.statusCode, 200, 'route exists and replies 200');
        t.ok(res.result.indexOf('Ben') > -1, 'old information has been kept');
        t.ok(res.result.indexOf('Maynard') > -1, 'updates have been saved');
        t.end();
      });
    });
  });
});


tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
