var tape = require('tape');
var jwt = require('jsonwebtoken');
var client = require('redis').createClient();

var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');
var setupData = require('../helpers/setup-data.js');

var admin_token = jwt.sign(setupData.initialSessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(setupData.initialSessions[2], process.env.JWT_SECRET);

tape('set up: initialise db', t => {
  setup.initialiseDB(() => {
    require('../../tags/csv-to-json.js')(() => {
      t.end();
    });
  });
});

tape('/challenges/add load general view', t => {
  var options = {
    method: 'GET',
    url: '/challenges/add',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf('Add A New Challenge'), 'organisations have been displayed');
    t.end();
  });
});

tape('/challenges/add (POST) - submit new challenge as an admin (expect fail)', t => {
  var options = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(options, reply => {
    t.equal(reply.statusCode, 500, 'Admin cannot add challenge, as no org attached');
    t.ok(reply.payload.indexOf('Admins cannot create a new challenge as no organisation is attached.' > -1), 'Error message to admin ok');
    t.end();
  });
});

tape('/challenges/add (POST) - submit new challenge as a primary_user without tags', t => {
  var options1 = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${primary_token}` }
  };
  var options2 = {
    method: 'POST',
    url: '/challenges/0/tags',
    payload: payloads.noTagsAdded,
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options1, reply => {
    t.equal(reply.statusCode, 302, 'create challenge');
    t.deepEquals(reply.result, { challengeId: 0 }, 'user is redirected to /challenges/0/tags to add tags');
    server.inject(options2, reply => {
      t.equal(reply.statusCode, 302, 'select no tags');
      t.ok(reply.headers.location.indexOf('/orgs/0') > -1, 'user is redirected to /orgs/0 to add tags');
      t.end();
    });
  });
});

tape('/challenges/add (POST) - submit new challenge as a primary_user with one tag only', t => {
  var options1 = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${primary_token}` }
  };
  var options2 = {
    method: 'GET',
    url: '/challenges/1/tags',
    headers: { cookie: `token=${primary_token}` }
  };
  var options3 = {
    method: 'POST',
    url: '/challenges/1/tags',
    payload: payloads.addOneTagOnly,
    headers: { cookie: `token=${primary_token}` }
  };
  var options4 = {
    method: 'GET',
    url: '/orgs/0',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options1, reply => {
    t.equal(reply.statusCode, 302, 'create challenge');
    t.deepEquals(reply.result, { challengeId: 1 }, 'user is redirected to /challenges/0/tags to add tags');
    server.inject(options2, reply => {
      t.equal(reply.statusCode, 200, 'select-tags-view exists (endpoint: /challenges/{id}/tags)');
      server.inject(options3, reply => {
        t.equal(reply.statusCode, 302, 'user selects some tags and is redirected to org view');
        t.ok(reply.headers.location.indexOf('/orgs/0') > -1, 'user is redirected to /orgs/0 upon successful completion of form');
        server.inject(options4, reply => {
          t.ok(reply.result.indexOf('Global Partner') > -1, 'challenge is displayed with Global Partners tag');
          t.end();
        });
      });
    });
  });
});


tape('/challenges/add (POST) - submit new challenge as a primary_user with multiple tags', t => {
  var options1 = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${primary_token}` }
  };
  var options2 = {
    method: 'GET',
    url: '/challenges/2/tags',
    headers: { cookie: `token=${primary_token}` }
  };
  var options3 = {
    method: 'POST',
    url: '/challenges/2/tags',
    payload: payloads.addTags,
    headers: { cookie: `token=${primary_token}` }
  };
  var options4 = {
    method: 'GET',
    url: '/orgs/0',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(options1, reply => {
    t.equal(reply.statusCode, 302, 'create challenge');
    t.deepEquals(reply.result, { challengeId: 2 }, 'user is redirected to /challenges/0/tags to add tags');
    server.inject(options2, reply => {
      t.equal(reply.statusCode, 200, 'select-tags-view exists (endpoint: /challenges/{id}/tags)');
      server.inject(options3, reply => {
        t.equal(reply.statusCode, 302, 'user selects some tags and is redirected to org view');
        t.ok(reply.headers.location.indexOf('/orgs/0') > -1, 'user is redirected to /orgs/0 upon successful completion of form');
        server.inject(options4, reply => {
          t.ok(reply.result.indexOf('Global Partner') > -1, 'challenge is displayed with Global Partners tag');
          t.ok(reply.result.indexOf('USA') > -1, 'challenge is displayed with USA tag');
          t.end();
        });
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
