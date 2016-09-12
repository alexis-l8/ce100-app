var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var Iron = require('iron');

var jwt = require('jsonwebtoken');
var setupData = require('../helpers/setup-data.js');
var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);



tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people/add check auth', t => {
  t.plan(3);
  var primaryCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${primary_token}` }
  };
  var adminCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}`}
  };
  var primaryCookiePost = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(primaryCookie, reply => {
    t.equal(reply.statusCode, 403, 'primary cannot access /people/add');
    server.inject(adminCookie, reply => {
      t.equal(reply.statusCode, 200, 'admin can access /people/add');
      server.inject(primaryCookiePost, reply => {
        t.equal(reply.statusCode, 403, 'primary can access /people/add');
        t.end();
      });
    });
  });
});

tape('add and activate a new user and updates the linked organisation', t => {
  t.plan(5);
  var addOrg = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  var addPerson = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(payloads.usersAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(addOrg, reply => {
    t.equal(reply.statusCode, 302, 'redirects');
    server.inject(addPerson, reply => {
      t.equal(reply.statusCode, 302, 'redirects');
      var newUrl = reply.headers.location;
      t.ok(newUrl === '/people', 'route redirects to /people');
      var userId = reply.result.userId;
      Iron.seal(userId, process.env.COOKIE_PASSWORD, Iron.defaults, (err, hashed) => {
        var activateUser = {
          method: 'POST',
          url: `/people/activate/${hashed}`,
          payload: JSON.stringify(payloads.usersActivatePayload)
        };
        server.inject(activateUser, reply => {
          t.equal(reply.headers.location, '/', 'completing activate user redirects to dashboard');
          t.ok(reply.headers['set-cookie'], 'cookie has been set');
          t.end();
        });
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
