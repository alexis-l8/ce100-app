const tape = require('tape');
const client = require('redis').createClient();
const server = require('../server/server.js');
const Iron = require('iron');
const mockData = require('./mock-data.js');

require('env2')('config.env');
const password = process.env.COOKIE_PASSWORD;
const cookie = process.env.COOKIE


tape('auth.js tests set up db', t => {
  client.RPUSH('people', JSON.stringify(mockData.newUserAdded), (err, data) => {
    if (err) { console.log(err); }
    console.log('setup: redis response to primary user added: ', data);
    t.end();
  });
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


tape('hit an authed route with a valid cookie containing valid users information', t => {
  t.plan(1);
    const options = {
      method: 'GET',
      url: '/get',
      headers: { cookie }
    };
    server.inject(options, res => {
      console.log(res,headers);
      t.equal(res.statusCode, 200, 'route allowed');
      t.end();
    });
});

tape.onFinish(() => {
  client.FLUSHDB();
  process.exit(0);
});
