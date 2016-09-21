var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var people = require('../helpers/setup/people.js')['people'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('admin edits user profile but doesnt change organisation', t => {
  var user = people[3];
  var toggleArchive = {
    method: 'GET',
    url: `/people/${user.id}/toggle-archive`,
    headers: { cookie: `token=${admin_token}` }
  };
  var viewEdit = {
    method: 'GET',
    url: `/people/${user.id}/edit`,
    payload: payloads.editUserPayloadOrgUnchanged,
    headers: { cookie: `token=${admin_token}` }
  };
  var viewLinkedOrg = {
    method: 'GET',
    url: `/orgs/${user.organisation_id}`,
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(viewEdit, res => {
    t.equal(res.statusCode, 200, 'route exists and replies 200');
    t.ok(res.payload.indexOf('Archive User') > -1, 'user is active');
    server.inject(toggleArchive, res => {
      t.equal(res.statusCode, 302, 'on archiving a user, page redirects');
      server.inject(viewEdit, res => {
        t.equal(res.statusCode, 200, 'route exists and replies 200');
        t.ok(res.payload.indexOf('Unarchive') > -1, 'user is now not active');
        t.ok(res.payload.indexOf('<option value=-1>Please Select</option>') > -1, 'The users organisation_id has been reset');
        server.inject(viewLinkedOrg, res => {
          t.ok(res.payload.indexOf('No Primary User Yet') > -1, 'The user has been removed from the organisations data store');
          server.inject(toggleArchive, res => {
            server.inject(viewEdit, res => {
              t.ok(res.payload.indexOf('Archive') > -1, 'user is now active');
              t.end();
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
