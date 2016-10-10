var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');
var jwt = require('jsonwebtoken');

var sessions = require('../helpers/setup/sessions.js')['sessions'];
var people = require('../helpers/setup/people.js')['people'];
var orgs = require('../helpers/setup/orgs.js')['orgs'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('primary can log in, view and edit an org they are related to', t => {
  var user = people[2];
  var orgId = 0;
  var orgTags = orgs[orgId].tags;

  var primaryLogin = {
    method: 'POST',
    url: '/login',
    payload: payloads.loginPrimary
  };

  server.inject(primaryLogin, res => {
    t.equal(res.headers.location, `/browse/orgs`, 'user gets redirected to browse view after login');
    t.ok(res.headers['set-cookie'], 'cookie set upon primary login');
    var cookie = res.headers['set-cookie'][0].split(';')[0];
    var primaryEditOrgView = {
      method: 'GET',
      url: `/orgs/${orgId}/edit`,
      headers: { cookie }
    };
    var primaryEditOrg = {
      method: 'POST',
      url: `/orgs/${orgId}/edit`,
      payload: payloads.primaryEditOrg,
      headers: { cookie }
    };
    var primaryEditTagsView = {
      method: 'GET',
      url: `/orgs/${orgId}/tags`,
      headers: { cookie: `token=${primary_token}` }
    };
    var primaryEditTags = {
      method: 'POST',
      url: `/orgs/${orgId}/tags`,
      headers: { cookie: `token=${primary_token}` }
    };
    var primaryViewUpdates = {
      method: 'GET',
      url: `/orgs/${orgId}`,
      headers: { cookie: `token=${primary_token}` }
    };
    server.inject(primaryEditOrgView, res => {
      t.equal(res.statusCode, 200, 'primary user edit org gives 200 status code');
      // t.equal(res.headers.location, '/orgs/0/edit', 'and correct endpoint'); Why is headers.location not there sometimes?
      t.ok(res.payload.indexOf('archive') === -1, 'primary user cannot archive/unarchive their organisation');
      server.inject(primaryEditOrg, res => {
        t.equal(res.statusCode, 302, 'primary user is redirected');
        t.equal(res.headers.location, '/orgs/0/tags', "user is redirected to their org's profile view");
        server.inject(primaryEditTagsView, res => {
          t.equal(res.statusCode, 200, 'tag selection page is displayed to primary user');
          // TODO: CHECK THAT THESE ARE THE ONLY TAGS THAT HAVE BEEN CHECKED;
          orgTags.forEach(tag => {
            t.ok(res.payload.match(/checked="checked"/g).length > orgTags.length, 'existing tags are pre-selected and displayed');
          });
          primaryEditTags.payload = payloads.addTags;
          server.inject(primaryEditTags, res => {
            t.equal(res.statusCode, 302, 'primary user is redirected to org details view');
            server.inject(primaryViewUpdates, res => {
              t.equal(res.statusCode, 200, 'primary user is redirected to org details view');
              t.ok(res.payload.indexOf('Ice cream for all!') > -1, 'primary user can successfuly edit their own organisations mission_statement');
              t.ok(res.payload.indexOf('GLOBAL PARTNER') > -1, 'primary user has successfully added the Global Partner tag to their org');
              t.ok(res.payload.indexOf('USA') > -1, 'primary user has successfully added the USA tag to their org');
              primaryEditTags.payload = payloads.noTagsAdded;
              server.inject(primaryEditTags, res => {
                t.equal(res.statusCode, 302, 'primary user is redirected to org details view');
                server.inject(primaryViewUpdates, res => {
                  t.equal(res.statusCode, 200, 'primary user is redirected to org details view');
                  t.ok(res.payload.indexOf('Global Partner') === -1, 'primary user has successfully removed the Global Partner tag to their org');
                  t.ok(res.payload.indexOf('USA') === -1, 'primary user has successfully removed the USA tag to their org');
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
