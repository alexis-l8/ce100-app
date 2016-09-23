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

tape('admin can view an org, edit, archive and unarchive it', t => {
  var org = setupData.initialOrgs[3]
  // view org, edit org, view org, archive org, view org, unarchive org
  var adminViewOrgBadId = {
    method: 'GET',
    url: `/orgs/-1`,
    headers: { cookie: `token=${admin_token}` }
  };
  var adminViewOrg = {
    method: 'GET',
    url: `/orgs/${org.id}`,
    headers: { cookie: `token=${admin_token}` }
  };
  var adminEditOrgView = {
    method: 'GET',
    url: `/orgs/${org.id}/edit`,
    headers: { cookie: `token=${admin_token}` }
  };
  var adminEditOrgSubmit = {
    method: 'POST',
    url: `/orgs/${org.id}/edit`,
    payload: payloads.adminEditOrg,
    headers: { cookie: `token=${admin_token}` }
  };
  var adminToggleArchiveOrg = {
    method: 'GET',
    url: `/orgs/${org.id}/toggle-archive`,
    headers: { cookie: `token=${admin_token}` }
  };
  var editUserView = {
    method: 'GET',
    url: `/people/${org.primary_id}/edit`,
    headers: { cookie: `token=${admin_token}` }
  };

  var orgName = org.name;
  server.inject(adminViewOrgBadId, res => {
    t.equal(res.headers.location, '/orgs', '/orgs/-1 redirects to /orgs');
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
              server.inject(editUserView, res => {
                t.ok(res.payload.indexOf('Unarchive User') > -1, 'user was deactivated as a result of deactivating organisation');
                server.inject(adminEditOrgView, res => {
                  t.ok(res.payload.indexOf('Unarchive') > -1, 'admin successfully archived org');
                  server.inject(adminToggleArchiveOrg, res => {
                    server.inject(adminEditOrgView, res => {
                      t.ok(res.payload.indexOf('Archive') > -1, 'org has been unarchived');
                      server.inject(editUserView, res => {
                        t.ok(res.payload.indexOf('Unarchive User') > -1, 'users activation status was unchanged as a result of reactivating linked organisation organisation');
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
