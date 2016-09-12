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

// TODO: edit primary user attached to this org

tape('admin can view an org, edit, archive and unarchive it', t => {
  // t.plan(11);
  // view org, edit org, view org, archive org, view org, unarchive org
  var adminViewOrg = {
    method: 'GET',
    url: '/orgs/3',
    headers: { cookie: `token=${admin_token}` }
  };
  var adminEditOrgView = {
    method: 'GET',
    url: '/orgs/3/edit',
    headers: { cookie: `token=${admin_token}` }
  };
  var adminEditOrgSubmit = {
    method: 'POST',
    url: '/orgs/3/edit',
    payload: payloads.adminEditOrg,
    headers: { cookie: `token=${admin_token}` }
  };
  var adminToggleArchiveOrg = {
    method: 'GET',
    url: '/orgs/3/toggle-archive',
    headers: { cookie: `token=${admin_token}` }
  };
  var orgName = setupData.initialOrgs[3].name;
  server.inject(adminViewOrg, res => {
    t.equal(res.statusCode, 200, '/orgs/id route exists');
    t.ok(res.payload.indexOf(orgName) > -1, 'server sends back the correct view');

    server.inject(adminEditOrgView, res => {
      t.equal(res.statusCode, 200, '/orgs/id/edit route exists');
      t.ok(res.payload.indexOf(orgName) > -1, 'server sends back the correct org');
      server.inject(adminEditOrgSubmit, res => {
        t.equal(res.statusCode, 302, '/orgs/id/edit post route redirects');
        t.equal(res.headers.location, '/orgs/3', 'redirects to /orgs');
        server.inject(adminViewOrg, res => {
          t.ok(res.payload.indexOf(payloads.adminEditOrg.name) > -1, 'the orgs name has been edited');
          t.ok(res.payload.indexOf(payloads.adminEditOrg.mission_statement) > -1, 'the orgs mission_statement has been edited');
          server.inject(adminToggleArchiveOrg, res => {
            t.equal(res.statusCode, 302, '/orgs/id/toggle-archive route redirects');
            t.equal(res.headers.location, '/orgs', 'admin is sent orgs view after editing');
            server.inject(adminEditOrgView, res => {
              t.ok(res.payload.indexOf('Unarchive') > -1, 'admin successfully archived org');
              server.inject(adminToggleArchiveOrg, res => {
                server.inject(adminEditOrgView, res => {
                  t.ok(res.payload.indexOf('Archive') > -1, 'org has been unarchived');
                  t.end();
                });
              });
            });
          });
        });
      });
    });
  });
});

tape('admin can view and edit an org which does not have a primary user attached to it yet', t => {
  t.plan(6);
  var adminViewOrg = {
    method: 'GET',
    url: '/orgs/5',
    headers: { cookie: `token=${admin_token}` }
  };
  var adminEditOrgView = {
    method: 'GET',
    url: '/orgs/5/edit',
    headers: { cookie: `token=${admin_token}` }
  };
  var orgName = setupData.initialOrgs[5].name;
  server.inject(adminViewOrg, res => {
    console.log(res.result);
    t.equal(res.statusCode, 200, '/orgs/id route exists for org without primary user');
    t.ok(res.payload.indexOf(orgName) > -1, 'server sends back the correct view');
    t.ok(res.payload.indexOf('No Primary User Yet') > -1, 'org view reacts to having no primary user correctly');

    server.inject(adminEditOrgView, res => {
      t.equal(res.statusCode, 200, '/orgs/id/edit route exists for org without primary user');
      t.ok(res.payload.indexOf(orgName) > -1, 'server sends back the correct org');
      // at the moment there is no instruction as to how this view should look when in edit mode and no primary user is attached.
      // Currently there is no mention of `primary user` in this view, but this may change.
      t.ok(res.payload.indexOf('Primary User') === -1, 'edit org view reacts to having no primary user correctly');
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
