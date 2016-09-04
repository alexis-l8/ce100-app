const tape = require('tape');
const bcrypt = require('bcrypt');
const client = require('redis').createClient();
const server = require('../../server/server.js');

const mockData = require('../helpers/mock-data.js');

// TODO: Route should be authed
// TODO: hash password in mock-data.js
// TODO: test without client

tape('set up usersActivate.test.js', t => {
  t.plan(2);
  client.RPUSH('organisations', JSON.stringify(mockData.orgPostUser), (error, response) => {
    t.ok(response, 'adding an organisation: response from redis is ' + response);
    client.RPUSH('people', JSON.stringify(mockData.newUserAdded), (error, response) => {
      t.ok(response, 'adding a primary user: response from redis is ' + response);
      t.end();
    });
  });
});

tape('testing endpoint: people/activate/{userID}', t => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/people/activate/0',
    payload: JSON.stringify(mockData.usersActivatePayload)
  };
  // hit endpoint with mock data
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, '/people/activate/0 route exists and replies 200');
    // check user has been updated
    client.LRANGE('people', 0, -1, (err, people) => {
      const user = JSON.parse(people[0]);
      const lastLoginDiff = Date.now() - user.last_login;
      t.ok(lastLoginDiff > 0 && lastLoginDiff < 100, 'last_login time stamped');
      t.ok(bcrypt.compareSync(mockData.usersActivatePayload.password, user.password), 'passwords match');
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
