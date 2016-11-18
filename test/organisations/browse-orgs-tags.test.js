var tape = require('tape');
var client = require('redis').createClient();
var jwt = require('jsonwebtoken');

var setup = require('../helpers/set-up.js');
var orgs = require('../helpers/setup/orgs.js')['orgs'];
var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);
var deleteTags = require('../helpers/delete-tags.js');
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer, pool) {
    deleteTags(pool, function (error, response) {
      console.log('tags table empty');
      server = initServer;
      t.end();
    })
  });
});

tape('/orgs/tag load general view', t => {
  var options = {
    method: 'GET',
    url: '/orgs/tags',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');

    t.ok(reply.payload.indexOf('<h3>Sorry! No tags were found</h3>') > -1, 'organisations have been displayed');
    t.end();
  });
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
