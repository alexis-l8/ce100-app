var tape = require('tape');
var jwt = require('jsonwebtoken');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

// Login; browse challenges view; add some filters; browse challenges view again; browse organisations view with same filters, browse organisations without filters;

tape('set up: initialise db', t => {
  setup.initialiseDB(() => {
    require('../../tags/csv-to-json.js')(() => t.end());
  });
});

tape('primary browse challenges', t => {
  var login = {
    method: 'POST',
    url: '/login',
    payload: payloads.loginPrimary
  };
  var browseChallenges = cookie => ({
    method: 'GET',
    url: '/challenges',
    headers: { cookie }
  });

  server.inject(login)
    .then(res => {
      t.ok(res.headers['set-cookie'], 'cookie set upon login');
      var cookie = res.headers['set-cookie'][0].split(';')[0];
      return server.inject(browseChallenges(cookie));
    })
    .then(res => {
      res.staus
    })
    .catch(err => {
      console.log(err);
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
