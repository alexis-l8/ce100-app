var tape = require('tape');
var jwt = require('jsonwebtoken');

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

tape('dynamic validation primary and admin', t => {
  var validateAdmin = {
    method: 'POST',
    url: '/orgs/0/edit',
    payload: { name: 'new name', mission_statement: 'new statement' },
    headers: { cookie: `token=${admin_token}`}
  };
  var validatePrimary = {
    method: 'POST',
    url: '/orgs/0/edit',
    payload: { mission_statement: 'new statement' },
    headers: { cookie: `token=${primary_token}`}
  };
  server.inject(validateAdmin, res => {
    t.equal(res.statusCode, 302, 'validation ok for admin');
    server.inject(validatePrimary, res => {
      t.equal(res.statusCode, 302, 'validation ok for primary');
      t.end();
    });
  });
});


tape.onFinish(() => {
  server.stop(() => {});
});
