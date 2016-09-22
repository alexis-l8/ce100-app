var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var jwt = require('jsonwebtoken');
var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);


tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('primary can log in, view and edit an org they are related to', t => {
  var user = setupData.initialPeople[2];

  var primaryLogin = {
    method: 'POST',
    url: '/login',
    payload: payloads.loginPrimary
  };

  server.inject(primaryLogin, res => {
    t.equal(res.headers.location, `/orgs/${user.organisation_id}`, "user gets redirected to their organisation's profile");
    t.ok(res.headers['set-cookie'], 'cookie set upon primary login');
    var cookie = res.headers['set-cookie'][0].split(';')[0];
    var primaryEditOrgView = {
      method: 'GET',
      url: '/orgs/0/edit',
      headers: { cookie }
    };
    var primaryEditOrg = {
      method: 'POST',
      url: '/orgs/0/edit',
      payload: { mission_statement: 'Ice cream for all!' },
      headers: { cookie }
    };
    server.inject(primaryEditOrgView, res => {
      t.equal(res.statusCode, 200, 'primary user edit org gives 200 status code');
      // t.equal(res.headers.location, '/orgs/0/edit', 'and correct endpoint'); Why is headers.location not there sometimes?
      t.ok(res.payload.indexOf('rchive') === -1, 'primary user cannot archive/unarchive their organisation');
      server.inject(primaryEditOrg, res => {
        t.equal(res.statusCode, 302, 'primary user is redirected');
        t.equal(res.headers.location, '/orgs/0', "user is redirected to their org's profile view");
        t.ok(res.payload.indexOf('Ice cream for all!') > -1, 'primary user can successfuly edit their own organisations mission_statement');
        t.end();
      });
    });
  });
});

tape('primary cannot get edit-org view if they are not linked and cannot make subsequent post request', t => {
  var primaryEditOrgView = {
    method: 'GET',
    url: '/orgs/3/edit',
    headers: { cookie: `token=${primary_token}` }
  };
  var primaryEditDiffOrg = {
    method: 'POST',
    url: '/orgs/3/edit',
    payload: { mission_statement: 'evil trickster' },
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(primaryEditOrgView, res => {
    t.equal(res.statusCode, 401, 'unauthorized status code');
    // TODO: Error handling needs to be fixed
    // t.ok(res.payload.indexOf('Unauthorized') > -1, ' primary cannot get edit-view an unrelated org');
    server.inject(primaryEditDiffOrg, res => {
      t.equal(res.statusCode, 401, 'unauthorized status code');
      // TODO: Error handling needs to be fixed
      // t.ok(res.payload.indexOf('Unauthorized') > -1, ' primary cannot edit an unrelated org');
      t.end();
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
