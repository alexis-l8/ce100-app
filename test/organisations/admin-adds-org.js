const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const mockData = require('../mock-data.js');

require('env2')('config.env');
const cookie = process.env.COOKIE;

tape('set up db', t => {
  client.RPUSH('people', JSON.stringify(mockData.orgsAddDB), (error, data) => {
    console.log('setup: redis response to org added: ', data);
    t.end();
  });
});

// TODO: Primary user should fail, admin should work

tape('orgs/add adds a new organisation', t => {
  t.plan(2);
  const options = {
    method: 'POST',
    url: '/orgs/add',
    payload: JSON.stringify(mockData.orgsAddPayload),
    headers: { cookie }
  };
  // hit endpoint with mock form
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    // check organisation has been added to db
    client.LRANGE('organisations', 0, -1, (error, orgs) => {
      console.log('ERROR', error);
      t.deepEqual(mockData.orgsAddDB, JSON.parse(orgs[0]), 'new organisation has correct fields');
      t.end();
    });
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.FLUSHDB();
  process.exit(0);
});
