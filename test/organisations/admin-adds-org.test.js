const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const payloads = require('../helpers/mock-payloads.js');
const setup = require('../helpers/set-up.js');

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('orgs/add view', t => {
  t.plan(2);
  const adminCookie = {
    method: 'GET',
    url: '/orgs/add',
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  const primaryCookie = {
    method: 'GET',
    url: '/orgs/add',
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  server.inject(primaryCookie, reply => {
    t.equal(reply.statusCode, 403, 'unauthorised user cannot access the route');

    server.inject(adminCookie, reply => {
      t.equal(reply.statusCode, 200, 'admin can access the route');
      t.end();
    });
  });
});

tape('orgs/add admin adds a new organisation', t => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 302, 'admin is redirected');
    const url = reply.headers.location;
    t.ok(url.indexOf('/orgs/') > -1, 'string', 'redirected to the new organisations view');
    const options2 = {
      method: 'GET',
      url: '/orgs',
      headers: { cookie: process.env.ADMIN_COOKIE }
    };
    server.inject(options2, reply => {
      t.ok(reply.payload.indexOf(payloads.orgsAddPayload.name) > -1, 'mock organisation was added');
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
