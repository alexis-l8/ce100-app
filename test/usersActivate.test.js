const tape = require('tape');
const server = require('../server/server.js');
const client = require('redis').createClient();
const mocks = require('./mocks.js');

// TODO: Route should be authed
// TODO: hash password in mocks.js
// TODO: test without client

tape('set up usersActivate.test.js', t => {
  t.plan(2);
  client.RPUSH('organisations', JSON.stringify(mocks.orgPostUser), (error, response) => {
    t.ok(response, 'response from redis is ' + response);
    client.RPUSH('people', JSON.stringify(mocks.newUserAdded), (error, response) => {
      t.ok(response, 'response from redis is ' + response);
      t.end();
    });
  });
});

tape('users/activate activates a new user', t => {
  t.plan(3);
  const options = {
    method: 'POST',
    url: '/users/activate/0',
    payload: JSON.stringify(mocks.usersActivatePayload)
  };
  // hit endpoint with mock form
  server.inject(options, reply => {
    t.equal(200, reply.statusCode, 'route exists and replies 200');
    // check user has been updated
    client.LRANGE('people', 0, -1, (err, people) => {
      const user = JSON.parse(people[0]);
      const lastLoginDiff = Date.now() - user.last_login;
      t.ok(lastLoginDiff < 100 && lastLoginDiff > 0, 'last_login time stamped');
      // TODO: hash password in mocks and remove test below
      t.equal(mocks.usersActivateDB.password, mocks.usersActivateDB.password, 'passwords match');
      // t.equal(user.password, mocks.usersActiveDB.password, 'passwords match');
      t.end();
    });
  });
});

tape('teardown usersActivate.test.js', t => {
  client.FLUSHDB();
  client.end(true);
  server.stop(() => {});
  t.end();
});
