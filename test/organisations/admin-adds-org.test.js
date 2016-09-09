const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const payloads = require('../helpers/mock-payloads.js');
const setup = require('../helpers/set-up.js');

var jwt = require('jsonwebtoken');
var admin_token = jwt.sign({userId: 0}, process.env.JWT_SECRET);
var primary_token = jwt.sign({userId: 2}, process.env.JWT_SECRET);


tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('orgs/add view', t => {
  t.plan(2);
  const adminCookie = {
    method: 'GET',
    url: '/orgs/add',
    headers: { cookie: `token=${admin_token}` }
  };
  const primaryCookie = {
    method: 'GET',
    url: '/orgs/add',
    headers: { cookie: `token=${primary_token}` }
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
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 302, 'admin is redirected');
    const url = reply.headers.location;
    t.ok(url.indexOf('/orgs/') > -1, 'string', 'redirected to the new organisations view');
    const options2 = {
      method: 'GET',
      url: '/orgs',
      headers: { cookie: `token=${admin_token}` }
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
