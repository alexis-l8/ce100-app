const tape = require('tape');
const client = require('redis').createClient();
const redis = require('../lib/db/redis.js');

const mockUser = {
  key: 'jm',
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 'org:apple',
  user_type: 'primary'
};


tape('set up db', t => {
  // set up db?
  t.end();
});

tape('can add a user to DB', (t) => {
  t.plan(3);
  t.ok(redis.addUser, 'addUser function exists');
  redis.addUser(client, mockUser, (err, data) => {
    t.equal(data, 'OK', 'it works');

    client.hgetall(mockUser.key, (err, data) => {
      const expected = mockUser.first_name;
      const actual = data.first_name;
      t.equal(expected, actual, 'correct first name of new user');
      // TODO: Test all fields of user
      t.end();
    });
  });
});

tape('can retrieve a user from DB', (t) => {
  t.plan(2);
  t.ok(redis.getUser, 'getUser function exists');
  redis.getUser(client, mockUser.key, (err, data) => {
    const expected = mockUser.first_name;
    const actual = data.first_name;
    t.equal(expected, actual, 'first name of user is correct');
    t.end();
  });
});


tape('teardown', t => {
  client.end(true);
  t.end();
});
