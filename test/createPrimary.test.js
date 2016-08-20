const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');

const mocks = require('./mocks.js');

tape('set up db', t => {
  client.RPUSH('organisations', JSON.stringify(mocks.orgPreUser), (err, data) => {
    console.log('Redis response to org added: ', data);
    t.end();
  });
});

tape('/add-user post adds a user and updates the linked organisation', (t) => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/add-user',
    payload: JSON.stringify(mocks.addUserPayload)
  };
  server.inject(options, reply => {
    t.equal(200, reply.statusCode, 'route exists and replies 200');
    //check user added to db
    client.LRANGE('people', 0, -1, (error, people) => {
      console.log('people in db ', people);
      t.deepEqual(JSON.parse(people[0]), mocks.newUserAdded, 'the new user has correct fields');
      // check organisations is updated
      client.LRANGE('organisations', 0, -1, (error, data) => {
        t.deepEqual(JSON.parse(data), mocks.orgPostUser, 'Primary user added to organisation');
        t.end();
      })
    });
  });
  // TODO: Route should be authed
});

tape('teardown', t => {
  client.flushdb();
  client.end(true);
  server.stop(() => {});
  t.end();
});
