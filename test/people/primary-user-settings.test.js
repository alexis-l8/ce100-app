var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);


tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

// test a primary user editing their settings

tape('primary user cannot GET or POST to edit user for different user', t => {
  var getOptions = {
    method: 'GET',
    url: '/people/3/edit',
    headers: { cookie: `token=${primary_token}` }
  };
  var postOptions = {
    method: 'POST',
    url: '/people/3/edit',
    payload: payloads.editUserPayloadOrgUnchanged,
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(getOptions, res => {
    t.equal(res.statusCode, 401, 'primary user cannot GET edit user view if wrong user');
    server.inject(postOptions, res => {
      // TODO: add restrictions to POST request
      // t.equal(res.statusCode, 401, 'primary user cannot POST edit user if wrong user');
      t.end();
    });
  });
});

// TODO: finish edit user POST functionailty
tape('primary user can edit their own profile', t => {
  t.end();
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
