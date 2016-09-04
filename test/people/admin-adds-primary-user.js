const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const mockData = require('../helpers/mock-data.js');
const setup = require('../helpers/set-up.js');

require('env2')('config.env');

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people/add check auth', t => {
  t.plan(3);
  const primaryCookie = {
    method: 'GET',
    url: '/orgs/add',
    payload: JSON.stringify(mockData.orgsAddPayload),
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  const adminCookie = {
    method: 'GET',
    url: '/orgs/add',
    payload: JSON.stringify(mockData.orgsAddPayload),
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  const primaryCookiePost = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(mockData.orgsAddPayload),
    headers: { cookie: process.env.PRIMARY_COOKIE }
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

tape('/people/add POST adds a user and updates the linked organisation', t => {
  t.plan(3);
  const addOrg = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(mockData.orgsAddPayload),
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  const addPerson = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(mockData.usersAddPayload),
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  server.inject(addOrg, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    server.inject(addPerson, reply => {
      t.equal(reply.statusCode, 302, 'redirects');
      const newUrl = reply.headers.location;
      t.ok(newUrl.indexOf('/people/') > -1, 'route redirects to /people/ind');
      t.end();
    });
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  process.exit(0);
});
