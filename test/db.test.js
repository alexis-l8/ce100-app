const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');

const mockAddUserPayload = {
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: '0',
  user_type: 'primary'
};

const mockNewUserAdded = {
  id: 0,
  first_name: 'jack',
  last_name: 'murphy',
  email: 'ja@mu.co',
  organisation_id: 0,
  user_type: 'primary',
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
  // any db set up can be done in here
  t.end();
});

tape('/add-user post adds a user to db', (t) => {
  t.plan(1);
  const options = {
    method: 'POST',
    url: '/add-user',
    payload: JSON.stringify(mockAddUserPayload)
  };
  server.inject(options, reply => {
    const exp = 200;
    const act = reply.statusCode;
    t.equal(exp, act, 'route exists and replies 200');
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
  t.end();
});
