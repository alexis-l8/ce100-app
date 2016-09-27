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
    require('../../tags/csv-to-json.js')(t.end);
  });
});

tape('/challenges/add load general view', t => {
  var options = {
    method: 'GET',
    url: '/challenges/add',
    headers: { cookie: `token=${primary_token}` }
  };

});

tape('/challenges/add (POST) - submit new challenge as an admin (expect fail)', t => {

});

tape('teardown', t => {
  client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
