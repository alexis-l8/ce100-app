var tape = require('tape');
var jwt = require('jsonwebtoken');
var client = require('redis').createClient();

var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');

var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);


tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/challenges/add load general view', t => {
  var options = {
    method: 'GET',
    url: '/challenges/add',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf('Add A New Challenge'), 'organisations have been displayed');
    t.end();
  });
});

tape('/challenges/add (POST) - submit new challenge as an admin (expect fail)', t => {
  var options = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 500, 'Admin cannot add challenge, as no org attaached');
    t.ok(reply.payload.indexOf('Admins cannot create a new challenge as no organisation is attached.'), 'Error message to admin ok');
    t.end();
  });
});

tape('/challenges/add (POST) - submit new challenge as a primary_user', t => {
  var options1 = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge1,
    headers: { cookie: `token=${primary_token}` }
  };
  var options2 = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge2,
    headers: { cookie: `token=${primary_token}` }
  };
  var options3 = {
    method: 'GET',
    url: '/orgs/0',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options1, reply => {
    t.equal(reply.statusCode, 302, 'on successful challenge creation, user is redirected');
    t.ok(reply.headers.location, '/orgs/0', 'User is redirected to /orgs/{{orgId}}');
    server.inject(options2, reply => {
      t.equal(reply.statusCode, 302, 'on successful challenge creation, user is redirected');
      t.ok(reply.headers.location, '/orgs/0', 'User is redirected to /orgs/{{orgId}}');
      server.inject(options3, reply => {
        t.ok(reply.payload.indexOf(payloads.addChallenge1.title), 'two challenges are now displayed');
        t.ok(reply.payload.indexOf(payloads.addChallenge2.title), 'two challenges are now displayed');
        t.end();
      });
    });
  });
});

tape('teardown', t => {
  // client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
