var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var Iron = require('iron');

var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

// /people/add auth checked in admin-adds-primary-user.test.js
tape('admin adds new user', t => {
  var adminAddNewUserView = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: `token=${admin_token}`}
  };
  var adminAddNewUser = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(payloads.adminAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(adminAddNewUserView, res => {
    t.equal(res.statusCode, 200, 'admin can access /people/add view');
    server.inject(adminAddNewUser, res => {
      t.equal(res.statusCode, 302, 'admin can access /people/add handler, new admin created and view is redirected');
      t.ok(res.result.userId > 0, 'new admin account has been successfully created');
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
