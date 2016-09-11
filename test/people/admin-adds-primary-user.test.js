const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const payloads = require('../helpers/mock-payloads.js');
const setup = require('../helpers/set-up.js');

const Iron = require('iron');

var jwt = require('jsonwebtoken');
var admin_token = jwt.sign({userId: 0}, process.env.JWT_SECRET);
var primary_token = jwt.sign({userId: 2}, process.env.JWT_SECRET);



tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people/add check auth', t => {
  t.plan(3);
  const primaryCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${primary_token}` }
  };
  const adminCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}`}
  };
  const primaryCookiePost = {
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
  const addOrg = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  const addPerson = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(payloads.usersAddPayload),
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(addOrg, reply => {
    t.equal(reply.statusCode, 302, 'redirects');
    server.inject(addPerson, reply => {
      t.equal(reply.statusCode, 302, 'redirects');
      const newUrl = reply.headers.location;
      t.ok(newUrl === '/people', 'route redirects to /people');
      const userId = reply.result.userId;
      Iron.seal(userId, process.env.COOKIE_PASSWORD, Iron.defaults, (err, hashed) => {
        const activateUser = {
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
