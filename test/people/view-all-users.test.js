var tape = require('tape');
var client = require('redis').createClient();
var setup = require('../helpers/set-up.js');
var payloads = require('../helpers/mock-payloads.js');
var jwt = require('jsonwebtoken');
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
});

tape('/people quick contact list page loads for primary user', t => {
  var options = {
    method: 'GET',
    url: '/people',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 200, 'route exists and replies 200');
    t.ok(res.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
    t.equal(res.payload.indexOf('Marie Kasai'), -1, 'primary user cannot view admins on quick contact list');
    t.equal(res.payload.indexOf('Coco'), -1, 'primary user cannot view inactive primary users on quick contact list');
    t.equal(res.payload.indexOf('/people/3/edit'), -1, 'primary user cannot see the edit button on quick contact list');
    t.end();
  });
});

tape('/people quick contact list page loads for admin', t => {
  var options = {
    method: 'GET',
    url: '/people',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 200, 'route exists and replies 200');
    t.ok(res.payload.indexOf('Ben Matthews') > -1, 'route serves up list of users');
    t.ok(res.payload.indexOf('Marie Kasai') > -1, 'admin can view admins on quick contact list');
    t.ok(res.payload.indexOf('Coco') > -1, 'admin can view inactive admins on quick contact list');
    t.ok(res.payload.indexOf('/people/3/edit') > -1, 'admin can see the edit button on quick contact list');
    t.end();
  });
});

tape('/people quick contact list sort users correctly', t => {
  var primaryQuickContacts = {
    method: 'GET',
    url: '/people',
    headers: { cookie: `token=${primary_token}` }
  };

  server.inject(primaryQuickContacts, res => {
    var viewableUsers = res.payload.split('list__ellipsis');
    var benInstances = [];
    viewableUsers.forEach((el, i) => {
      el.indexOf('Ben M') > -1 && benInstances.push(i);
    });
    t.equal(benInstances.length, 2, 'There are two users with the same name in contact list');
    t.equal(benInstances[0] + 1, benInstances[1], 'The users called Ben are listed together, sorting alphabetically worked');
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
