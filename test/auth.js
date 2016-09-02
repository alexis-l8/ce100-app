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
    url: '/get'
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 302, 'un authed replies with a redirect');
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
      t.equal(res.statusCode, 200, 'route allowed');
      t.end();
    });
});


// this test mocks a login. Shouldn't be in this file but I don't yet have login functionality
tape('hit /set (mocking a login) then hit an authed route', t => {
  t.plan(2);
  var obj = { userId: 0 };
  Iron.seal(obj, password, Iron.defaults, function (err, sealed) {
    const options1 = {
      method: 'GET',
      url: '/set'
    };
    const options2 = {
      method: 'GET',
      url: '/get'
    };
    server.inject(options1, res => {
      console.log(res.headers);
      t.equal(res.statusCode, 200, 'route allowed');
      res.headers['set-cookie']
      server.inject(options2, res2 => {
        t.equal(res.statusCode, 200, 'route allowed');
        t.end();
      });
    });
  });
});


tape.onFinish(() => {
  client.FLUSHDB();
  process.exit(0);
});
