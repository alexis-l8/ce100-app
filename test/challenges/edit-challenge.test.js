var tape = require('tape');
var jwt = require('jsonwebtoken');
var client = require('redis').createClient();

var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(() => {
    require('../../tags/csv-to-json.js')(() => {
      t.end();
    });
  });
});

// load edit view
// check pre-filled
// check existing tags are displayed


// server.inject - POST overwrite the existing title and description
// server.inject - POST remove 1 tag, add 5 new tags
// server.inject - GET org view - check title, description and tags have been updated.


// CHECK PERMISSION TO EDIT!!!
tape('/challenges/edit load general view', t => {
  var options = {
    method: 'GET',
    url: '/challenges/0/edit',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf('Add A New Challenge'), 'organisations have been displayed');
    t.end();
  });
});
