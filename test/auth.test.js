var tape = require('tape');
var client = require('redis').createClient();
var server = require('../server/server.js');
var setup = require('./helpers/set-up.js');

var jwt = require('jsonwebtoken');
var admin_token = jwt.sign({userId: 0}, process.env.JWT_SECRET);
var primary_token = jwt.sign({userId: 2}, process.env.JWT_SECRET);


tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

// need to implement hapi-error to get redirect to work.
// tape('hit an authed route without a cookie redirects to /login', t => {
//   t.plan(2);
//   var options = {
//     method: 'GET',
//     url: '/people/add'
//   };
//   server.inject(options, res => {
//     t.equal(res.statusCode, 302, 'un authed request replies with a redirect');
//     t.equal(res.headers.location, '/login', 'redirects to `login`');
//     t.end();
//   });
// });

tape('A primary user is forbidden access to an admin view', t => {

  var options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 403, 'incorrect permission request is forbidden');
    t.end();
  });
});

tape('hit an authed route with a valid cookie containing valid users information', t => {

  var options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: `token=${admin_token}` }
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
