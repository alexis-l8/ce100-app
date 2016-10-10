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
  setup.initialiseDB(t.end);
});

var addTagsView = (type) => ({
  url: `/browse/${type}/tags`,
  method: 'GET',
  headers: { cookie: `token=${primary_token}` }
});

tape('add tags view', t => {
  server.inject(addTagsView('orgs'), res => {
    t.equal(res.statusCode, 200, '/browse/orgs/tags exists');
    t.ok(res.payload.indexOf('Select Tags') > -1, 'correct view is displayed');
    t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for orgs');
    t.ok(res.payload.indexOf('CORPORATE') > -1, 'corporate parent tag in payload for orgs');
    server.inject(addTagsView('people'), res => {
      t.equal(res.statusCode, 200, '/browse/challenges/tags exists');
      t.ok(res.payload.indexOf('Select Tags') > -1, 'correct view is displayed');
      t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for challenges');
      t.ok(res.payload.indexOf('CORPORATE') > -1, 'corporate parent tag in payload for challenges');
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
