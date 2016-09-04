const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const mockData = require('../helpers/mock-data.js');
const setup = require('../helpers/set-up.js');

const Iron = require('iron');

require('env2')('config.env');

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people/add check auth', t => {
  t.plan(3);
  const primaryCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(mockData.orgsAddPayload),
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  const adminCookie = {
    method: 'GET',
    url: '/people/add',
    payload: JSON.stringify(mockData.orgsAddPayload),
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  const primaryCookiePost = {
    method: 'POST',
    url: '/people/add',
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

tape('add and activate a new user and updates the linked organisation', t => {
  t.plan(5);
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
      t.ok(newUrl.indexOf('/people/') > -1, 'route redirects to /people/index');
      const userId = newUrl.split('/')[2];
      Iron.seal(userId, process.env.COOKIE_PASSWORD, Iron.defaults, (err, hashed) => {
        const activateUser = {
          method: 'POST',
          url: `/people/activate/${hashed}`,
          payload: JSON.stringify(mockData.usersActivatePayload)
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
  process.exit(0);
});
