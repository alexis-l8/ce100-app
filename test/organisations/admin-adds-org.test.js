const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const mockData = require('../mock-data.js');

// TODO: Route should be authed

tape('set orgsAdd.test.js', t => {
  // Set up db
  t.end();
});

tape('orgs/add adds a new organisation', t => {
  t.plan(2);
  const options = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(mockData.orgsAddPayload)
  };
  // hit endpoint with mock form
  server.inject(options, reply => {
    t.equal(200, reply.statusCode, 'route exists and replies 200');
    // check organisation has been added to db
    client.LRANGE('organisations', (err, orgs) => {
      t.deepEqual(JSON.parse(orgs[0]), mockData.orgsAddDB, 'new organisation has correct fields');
      t.end();
    });
  });
});

// tape('teardown orgsAdd.test.js', t => {
//   t.end();
//   client.end(true);
//   server.stop(() => {});
// });

tape.onFinish(() => {
  client.FLUSHDB();
  process.exit(0);
});
