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

tape('add tags view', t => {
  var addTagsView = {
    url: '/orgs/browse/tags',
    method: 'GET',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(addTagsView, res => {
    t.equal(res.statusCode, 200, '/challenges/browse/tags exists');
    t.ok(res.payload.indexOf('Select Tags') > -1, 'correct view is displayed');
    t.end();
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
