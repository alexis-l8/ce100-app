var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var orgs = require('../helpers/setup/orgs.js')['orgs'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

// test editing an unattached user, and attaching them to an organisation
// oldOrgId = -1, newOrgId = 6.
tape('admin edits user profile includes removing their link to an organisation', t => {
  t.plan(4);
  var newOrg = orgs[6];
  var editUserView = {
    method: 'GET',
    url: '/people/9/edit',
    headers: { cookie: `token=${admin_token}` }
  };
  var editUserSubmit = {
    method: 'POST',
    url: '/people/9/edit',
    payload: payloads.editUserAddOrg,
    headers: { cookie: `token=${admin_token}` }
  };
  var viewOrg = {
    method: 'GET',
    url: '/orgs/6',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(editUserSubmit, res => {
    t.equal(res.statusCode, 302, 'on updating a user, page redirects');
    server.inject(editUserView, res => {
      t.equal(res.statusCode, 200, 'route exists and replies 200');
      // TODO: make real test testing org has been added
      t.ok(res.payload.indexOf(newOrg.name) > -1, 'Organisation has been added to user');
      // check that the org has been updated and has a primary user attached
      server.inject(viewOrg, res => {
        t.ok(res.payload.indexOf('Anna') > -1, 'the user has been added to the organisation');
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
