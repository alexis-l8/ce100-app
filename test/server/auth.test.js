var tape = require('tape');
var jwt = require('jsonwebtoken');
var aguid = require('aguid');

var setup = require('../helpers/set-up.js');

var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
});

tape('hit an authed route without a cookie get 401', t => {
  var options = {
    method: 'GET',
    url: '/people/add'
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 401, 'request a endpoint requiring auth get 401');
    t.end();
  });
});

tape('A valid JWT with invalid jti fails Auth', t => {
  var validTokenNoSession = jwt.sign({ jti: aguid() }, process.env.JWT_SECRET);
  var options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: 'token=' + validTokenNoSession }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 401, 'invalid user fails auth');
    t.end();
  });
});

tape('A valid user with EXPIRED SESSION', t => {
  var expired = jwt.sign(sessions[3], process.env.JWT_SECRET);

  var options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: 'token=' + expired }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 401, 'Expired Session fails auth');
    t.end();
  });
});

tape('A valid JWT.jti (session) without a valid user fails auth', t => {
  var nouser = jwt.sign(sessions[4], process.env.JWT_SECRET);

  var options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: 'token=' + nouser }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 401, 'invalid user fails auth');
    t.end();
  });
});

tape('A valid JWT without a user in the database fails Auth', t => {
  var uid = Math.ceil(Math.random() * 10000000000);
  var validTokenButNotRealUser = jwt.sign({userId: uid}, process.env.JWT_SECRET);

  var options = {
    method: 'GET',
    url: '/people/add',
    headers: { cookie: 'token=' + validTokenButNotRealUser }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 401, 'invalid user fails auth');
    t.end();
  });
});

tape('A primary user is forbidden access to an admin view', t => {
  t.plan(1);
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
  t.plan(1);
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

tape.onFinish(() => {
  server.stop(() => {});
});
