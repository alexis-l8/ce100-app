var tape = require('tape');
var server = require('../../server/server.js');
var jwt = require('jsonwebtoken');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(() => {
    require('../../tags/csv-to-json.js')(() => {
      t.end();
    });
  });
});

tape('view all parent tags - no auth', t => {
  var options = {
    method: 'GET',
    url: '/tags'
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 401, 'denied access to endpoint');
    t.end();
  });
});

tape('view all parent tags', t => {
  var options = {
    method: 'GET',
    url: '/tags',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, res => {
    t.equal(res.statusCode, 200, 'endpoint exists');
    t.ok(res.result.indexOf('Tags'), 'view with correct title is returned');
    t.end();
  });
});

tape.onFinish(() => {
  server.stop(() => {});
});
