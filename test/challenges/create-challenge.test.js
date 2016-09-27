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
    t.equal(reply.statusCode, 403, 'Admin cannot add challenge, as no org attached');
    t.ok(reply.payload.indexOf('Admins cannot create a new challenge as no organisation is attached.'), 'Error message to admin ok');
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
  server.inject(options1, reply => {
    t.equal(reply.statusCode, 302, 'create challenge');
    t.ok(reply.result.challengeId > -1, 'user is redirected to /challenges/0/tags to add tags');
    var options2 = {
      method: 'POST',
      url: `/challenges/${reply.result.challengeId}/tags`,
      payload: payloads.noTagsAdded,
      headers: { cookie: `token=${primary_token}` }
    };
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
  server.inject(options1, reply => {
    t.equal(reply.statusCode, 302, 'create challenge');
    t.ok(reply.result.challengeId > -1, 'user is redirected to /challenges/0/tags to add tags');
    var challengeId = reply.result.challengeId;
    var options2 = {
      method: 'GET',
      url: `/challenges/${challengeId}/tags`,
      headers: { cookie: `token=${primary_token}` }
    };
    server.inject(options2, reply => {
      t.equal(reply.statusCode, 200, 'select-tags-view exists (endpoint: /challenges/{id}/tags)');
      var options3 = {
        method: 'POST',
        url: `/challenges/${challengeId}/tags`,
        payload: payloads.addOneTagOnly,
        headers: { cookie: `token=${primary_token}` }
      };
      server.inject(options3, reply => {
        t.equal(reply.statusCode, 302, 'user selects some tags and is redirected to org view');
        t.ok(reply.headers.location.indexOf('/orgs') > -1, 'user is redirected to /orgs/0 upon successful completion of form');
        var options4 = {
          method: 'GET',
          url: reply.headers.location,
          headers: { cookie: `token=${primary_token}` }
        };
        server.inject(options4, reply => {
          t.ok(reply.result.indexOf('GLOBAL PARTNER') > -1, 'challenge is displayed with Global Partners tag');
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
  server.inject(options1, reply => {
    t.equal(reply.statusCode, 302, 'create challenge');
    var challengeId = reply.result.challengeId;
    t.ok(challengeId > -1, 'user is redirected to /challenges/{id}/tags to add tags');
    var options2 = {
      method: 'GET',
      url: `/challenges/${challengeId}/tags`,
      headers: { cookie: `token=${primary_token}` }
    };
    server.inject(options2, reply => {
      t.equal(reply.statusCode, 200, 'select-tags-view exists (endpoint: /challenges/{id}/tags)');
      t.ok(reply.payload.indexOf('<h1 class="title">Tags</h1>') > -1, 'user is redirected to /challenges/{id}/tags to add tags');
      var options3 = {
        method: 'POST',
        url: `/challenges/${challengeId}/tags`,
        payload: payloads.addTags,
        headers: { cookie: `token=${primary_token}` }
      };
      server.inject(options3, reply => {
        t.equal(reply.statusCode, 302, 'user selects some tags and is redirected to org view');
        t.ok(reply.headers.location.indexOf('/orgs') > -1, 'user is redirected to /orgs/0 upon successful completion of form');
        var options4 = {
          method: 'GET',
          url: reply.headers.location,
          headers: { cookie: `token=${primary_token}` }
        };
        server.inject(options4, reply => {
          t.ok(reply.result.indexOf('GLOBAL PARTNER') > -1, 'challenge is displayed with Global Partners tag');
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
