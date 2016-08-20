const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');

const mocks = require('./mocks.js');

// TODO: Route should be authed

tape('set up db', t => {
  client.RPUSH('organisations', JSON.stringify(mocks.orgsAddDB), (err, data) => {
    console.log('Redis response to org added: ', data);
    t.end();
  });
});

tape('/add-user post adds a user and updates the linked organisation', (t) => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/add-user',
    payload: JSON.stringify(mocks.usersAddPayload)
  };
  server.inject(options, reply => {
    t.equal(200, reply.statusCode, 'route exists and replies 200');
    //check user added to db
    client.LRANGE('people', 0, -1, (error, people) => {
      t.deepEqual(JSON.parse(people[0]), mocks.newUserAdded, 'the new user has correct fields');
      // check organisations is updated
      client.LRANGE('organisations', 0, -1, (error, orgs) => {
        t.deepEqual(JSON.parse(orgs[0]), mocks.orgPostUser, 'Primary user added to organisation');
        t.end();
      });
    });
  });
});

tape('teardown', t => {
  client.flushdb();
  client.end(true);
  server.stop(() => {});
  t.end();
});
