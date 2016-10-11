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
  url: `/${type}/tags`,
  method: 'GET',
  headers: { cookie: `token=${primary_token}` }
});

tape('add tags view', t => {
  server.inject(addTagsView('orgs'), res => {
    t.equal(res.statusCode, 200, '/orgs/tags exists');
    t.ok(res.payload.indexOf('All tags') > -1, 'correct view is displayed');
    t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for orgs');
    t.ok(res.payload.indexOf('Corporate') > -1, 'corporate child tag in payload for orgs');
    server.inject(addTagsView('challenges'), res => {
      t.equal(res.statusCode, 200, '/challenges/tags exists');
      t.ok(res.payload.indexOf('All tags') > -1, 'correct view is displayed');
      t.ok(res.payload.indexOf('ENERGY') > -1, 'ENERGY parent tag in payload for challenges');
      t.ok(res.payload.indexOf('Corporate') > -1, 'corporate child tag in payload for orgs');
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
