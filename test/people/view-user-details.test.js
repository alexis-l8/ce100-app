const tape = require('tape');
const client = require('redis').createClient();
const server = require('../../server/server.js');
const setup = require('../helpers/set-up.js');

const setupData = require('../helpers/setup-data.js');

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('/people page loads with a users info', t => {
  const options = {
    method: 'GET',
    url: '/people/3',
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf(setupData.initialPeople[3].first_name) > -1, 'route replies with view containing users name');
    t.end();
  });
});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
