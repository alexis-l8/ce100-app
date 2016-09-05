const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');

const setup = require('./helpers/set-up.js');

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('hit an authed route without a cookie redirects to /login', t => {
  t.plan(2);
  const options = {
    method: 'GET',
    url: '/people/add'
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 302, 'un authed request replies with a redirect');
    t.equal(res.headers.location, '/login', 'redirects to `login`');
    t.end();
  });
});

tape('A primary user is forbidden access to an admin view', t => {
  t.plan(1);
  const options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: process.env.PRIMARY_COOKIE }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 403, 'incorrect permission request is forbidden');
    t.end();
  });
});

tape('hit an authed route with a valid cookie containing valid users information', t => {
  t.plan(1);
  const options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: process.env.ADMIN_COOKIE }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 200, 'route allowed');
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
