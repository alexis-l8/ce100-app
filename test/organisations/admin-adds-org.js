const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const payloads = require('../helpers/mock-payloads.js');
const setup = require('../helpers/set-up.js');


tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

// TODO: finish orgs/add test to check response indicating org has been added

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
  t.plan(1);
  const options = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(payloads.orgsAddPayload),
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  // hit endpoint with mock form
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
    // check organisation has been added to db
    // client.LRANGE('organisations', 0, -1, (error, orgs) => {
    //   console.log('ERROR', error);
    //   t.deepEqual(payloads.orgsAddDB, JSON.parse(orgs[0]), 'new organisation has correct fields');
    //   t.end();
    // });
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  console.log('in on finish');
  process.exit(0);
});
