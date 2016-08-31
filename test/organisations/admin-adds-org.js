const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const mockData = require('../mock-data.js');

// TODO: Route should be authed

tape('set orgsAdd.test.js', t => {
  // Set up db
  t.end();
});

tape('/orgs/add load page', t => {
  const options = {
    method: 'GET',
    url: '/orgs/add'
  };
  server.inject(options, reply => {
    console.log(reply);
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.end();
  });
});

tape('orgs/add posts new organisation details', t => {
  t.plan(2);
  const options = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(mockData.orgsAddPayload)
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    client.LRANGE('organisations', 0, -1, (error, organisations) => {
      t.deepEqual(JSON.parse(organisations[0]), mockData.orgsAddDB, 'new organisation has been stored in the DB with correct fields');
      t.end();
    });
  });
});

tape.onFinish(() => {
  client.FLUSHDB();
  process.exit(0);
});
