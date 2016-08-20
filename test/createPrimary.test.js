const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');

const mocks = require('./mocks.js');

tape('set up db', t => {
  client.RPUSH('organisations', JSON.stringify(mocks.OrgPreUser), (err, data) => {
    console.log('Redis response to org added: ', data);
  });
  t.end();
});

tape('/add-user post adds a user to db', (t) => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/add-user',
    payload: JSON.stringify(mocks.AddUserPayload)
  };
  server.inject(options, reply => {
    client.LRANGE('people', 0, -1, (error, data) => {
      t.equal(200, reply.statusCode, 'route exists and replies 200');
      t.ok(data, 'adds mocks. data to db');
      t.deepEqual(JSON.parse(data[0]), mocks.NewUserAdded, 'the new user has correct fields');
      t.end();
    });
  });
  // create new organisation
  // test new organisation exists
  // create new user
  // test that user exists in db
  // reply as expected
  // Route should be authed
});

tape('teardown', t => {
  // client.flushdb();
  client.end(true);
  server.stop(() => {});
  t.end();
});
