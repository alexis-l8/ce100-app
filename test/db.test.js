const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');

// how to access client
// delete organisation set the only wa

const mockAddUserPayload = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary'
};

const mockNewUserAdded = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary',
  id: 0,
  active: true
};

const mockOrgPreUser = {
  id: 0,
  name: 'apple',
  active: true,
  mission_statement: 'Change the economy'
};

const mockOrgPostUser = {
  id: 0,
  name: 'apple',
  active: true,
  mission_statement: 'Change the economy',
  primary_id: 0,
  people: [0]
};

tape('set up db', t => {
  client.RPUSH('organisations', JSON.stringify(mockOrgPreUser), (err, data) => {
    console.log('Redis response to org added: ', data);
  })
  t.end();
});

tape('/add-user post adds a user to db', (t) => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/add-user',
    payload: JSON.stringify(mockAddUserPayload)
  };
  server.inject(options, reply => {
    client.LRANGE('people', 0, -1, (error, data) => {
      t.equal(200, reply.statusCode, 'route exists and replies 200');
      t.ok(data, 'adds mock data to db');
      t.deepEqual(JSON.parse(data[0]), mockNewUserAdded, 'the new user has correct fields');
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
  client.flushdb();
  client.end(true);
  server.stop(() => {});
  t.end();
});
