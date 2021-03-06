var tape = require('tape');
var client = require('redis').createClient();
var setup = require('../helpers/set-up.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var orgs = require('../helpers/setup/orgs.js')['orgs'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
});

// test editing an attached user, but removing their link to an organisation
// oldOrgId = 1, newOrgId = -1.
// then go on to test oldOrgId = -1, newOrgId = -1.
tape('admin edits user profile includes removing their link to an organisation', t => {
  t.plan(9);
  var oldOrg = orgs[1];
  var editUserView = {
    method: 'GET',
    url: '/people/3/edit',
    headers: { cookie: `token=${admin_token}` }
  };
  var editUserSubmit = {
    method: 'POST',
    url: '/people/3/edit',
    payload: payloads.editUserRemoveOrg,
    headers: { cookie: `token=${admin_token}` }
  };
  var viewOrg = {
    method: 'GET',
    url: `/orgs/${oldOrg.id}`,
    headers: { cookie: `token=${admin_token}` }
  };

  server.inject(editUserView, res => {
    t.equal(res.statusCode, 200, 'route exists and replies 200');
    server.inject(editUserSubmit, res => {
      t.equal(res.statusCode, 302, 'on updating a user, page redirects to /people/{{id}}');
      server.inject(editUserView, res => {
        t.equal(res.statusCode, 200, 'route exists and replies 200');
        // TODO: check if org has been removed from their profile
        // maybe view /people and check that ben doesn't have an org?
        t.ok(res.result.indexOf('Ben') > -1, 'old information has been kept');
        t.ok(res.result.indexOf('Maynard') > -1, 'updates have been saved');

        // check that the org has been updated and no longer has a primary user attached
        server.inject(viewOrg, res => {
          t.ok(res.payload.indexOf('No Primary User Yet') > -1, 'the user has been removed from the orgs primary_id');
          // Now test org not changed when editing user and: oldOrgId = -1, newOrgId = -1.
          server.inject(editUserSubmit, res => {
            t.equal(res.statusCode, 302, 'edit user again and leave user without an org. POST request redirects.');
            server.inject(editUserView, res => {
              // TODO: test that the seleceted/checked organisation_id is still -1
              t.ok(res.payload, 'user still has no org'); // dummy test, see line above
              // check the org still has no link to old primary user
              server.inject(viewOrg, res => {
                t.ok(res.payload.indexOf('No Primary User Yet') > -1, 'organisation still does not recognise old primary user');
                t.end();
              });
            });
          });
        });
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
