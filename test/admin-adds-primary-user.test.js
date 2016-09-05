const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');

const mockData = require('./mock-data.js');

// TODO: Route should be authed

tape('set up db', t => {
  client.RPUSH('organisations', JSON.stringify(mockData.orgsAddDB), (err, data) => {
    console.log('setup: redis response to org added: ', data);
    t.end();
  });
});

tape('/add-user post adds a user and updates the linked organisation', (t) => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/people/add',
    payload: JSON.stringify(mockData.usersAddPayload)
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    //check user added to db
    client.LRANGE('people', 0, -1, (error, people) => {
      t.deepEqual(JSON.parse(people[0]), mockData.newUserAdded, 'the new user has correct fields');
      client.LRANGE('organisations', 0, -1, (error, orgs) => {
        t.deepEqual(JSON.parse(orgs[0]), mockData.orgPostUser, 'Primary user added to organisation');
        t.end();
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
