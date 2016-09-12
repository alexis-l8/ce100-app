var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');
var payloads = require('../helpers/mock-payloads.js');

var jwt = require('jsonwebtoken');
var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(t.end);
});

tape('test user profile updated for different organisation', t => {
  t.plan(5);
  var getOptions = {
    method: 'GET',
    url: '/people/3/edit',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(getOptions, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    var postOptions = {
      method: 'POST',
      url: '/people/3/edit',
      payload: payloads.editUserPayload,
      headers: { cookie: `token=${admin_token}` }
    };
    server.inject(postOptions, reply => {
      console.log(reply.result);
      t.equal(reply.statusCode, 302, 'on updating a user, page redirects to /people/{{id}}');
      server.inject(getOptions, reply => {
        // console.log(reply);
        t.equal(reply.statusCode, 200, 'route exists and replies 200');
        t.ok(reply.result.indexOf('<input class="form__input" name="first_name" value="Ben">'), 'old information has been kept');
        t.ok(reply.result.indexOf('<input class="form__input" name="last" value="Maynard">'), 'updates have been saved');
        t.end();
      });
    });
  });
});

tape('test user profile updated (for same organisation)', t => {
  t.plan(5);
  var getOptions = {
    method: 'GET',
    url: '/people/3/edit',
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(getOptions, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    var postOptions = {
      method: 'POST',
      url: '/people/3/edit',
      payload: payloads.editUserPayloadOrgUnchanged,
      headers: { cookie: `token=${admin_token}` }
    };
    server.inject(postOptions, reply => {
      console.log(reply.result);
      t.equal(reply.statusCode, 302, 'on updating a user, page redirects to /people/{{id}}');
      server.inject(getOptions, reply => {
        // console.log(reply);
        t.equal(reply.statusCode, 200, 'route exists and replies 200');
        t.ok(reply.result.indexOf('<input class="form__input" name="first_name" value="Ben">'), 'old information has been kept');
        t.ok(reply.result.indexOf('<input class="form__input" name="last" value="Maynard">'), 'updates have been saved');
        t.end();
      });
    });
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
