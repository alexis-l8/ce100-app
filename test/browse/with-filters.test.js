var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(() => t.end());
});

var filteredBrowse = type => tagId => ({
  method: 'GET',
  url: `/${type}?tags=${tagId}`,
  headers: { cookie: `token=${primary_token}` }
});

var browseChallenges = filteredBrowse('challenges');
var browseOrgs = filteredBrowse('orgs');

tape('filtered browse challenges', t => {
  server.inject(browseChallenges('0,50'), res => {
    t.equal(res.statusCode, 200, 'request returns 200');
    t.ok(res.payload.indexOf('Nothing meets your search criteria') > -1, 'if tag id is not recognised, we let the user know');
    server.inject(browseChallenges('0,0'), res => {
      t.equal(res.statusCode, 200, 'request returns 200');
      t.ok(res.payload.indexOf('Nothing meets your search criteria') > -1, 'if no challenges meet the filters, we let the user know');
      server.inject(browseChallenges('1,1'), res => {
        t.equal(res.statusCode, 200, 'request returns 200');
        t.ok(res.payload.indexOf('Challenge Number 4') > -1, 'if a challenge meets the filters, it shows up in the browse');
        t.equal(res.payload.indexOf('Challenge Number 6'), -1, 'if a challenge has no tags, it does not show up in the browser');
        t.equal(res.payload.indexOf('Challenge Number 7'), -1, 'if a challenge does not meets the filters, it does not shows up in the browse');
        t.equal(res.payload.indexOf('Ice Bucket'), -1, 'if a challenge is archived, it does not shows up in the browse');
        t.end();
      });
    });
  });
});

tape('filtered browse orgs', t => {
  server.inject(browseOrgs('0,50'), res => {
    t.equal(res.statusCode, 200, 'request returns 200');
    t.ok(res.payload.indexOf('Nothing meets your search criteria') > -1, 'if tag id is not recognised, we let the user know');
    server.inject(browseOrgs('0,0'), res => {
      t.equal(res.statusCode, 200, 'request returns 200');
      t.ok(res.payload.indexOf('Apple') > -1, 'if an organisation matches a selected filter, they are displayed');
      server.inject(browseOrgs('14,1'), res => {
        t.equal(res.statusCode, 200, 'request returns 200');
        t.ok(res.payload.indexOf('Nothing meets your search criteria') > -1, 'if tag id is not recognised, we let the user know');
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
