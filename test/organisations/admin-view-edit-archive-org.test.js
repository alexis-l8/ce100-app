var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var jwt = require('jsonwebtoken');
var admin_token = jwt.sign({userId: 0}, process.env.JWT_SECRET);
var primary_token = jwt.sign({userId: 2}, process.env.JWT_SECRET);


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

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
