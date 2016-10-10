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
  setup.initialiseDB(() => t.end());
});

tape('/challenges/add load general view', t => {
  var viewAddChallengePage = {
    method: 'GET',
    url: '/challenges/add',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(viewAddChallengePage, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.payload.indexOf('Add A New Challenge') > -1, 'organisations have been displayed');
    t.end();
  });
});

tape('/challenges/add (POST) - submit new challenge as an admin (expect fail)', t => {
  var createNewChallenge = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${admin_token}` }
  };
  server.inject(createNewChallenge, reply => {
    t.equal(reply.statusCode, 403, 'Admin cannot add challenge, as no org attached');
    t.end();
  });
});

tape('/challenges/add (POST) - submit new challenge as a primary_user without tags', t => {
  var createNewChallenge = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(createNewChallenge, reply => {
    var challengeId = reply.result.challengeId;
    var url = reply.headers.location;
    t.equal(reply.statusCode, 302, 'challenge created and user is redirected to different view');
    t.equal(url, `/challenges/${challengeId}/tags`, 'user is redirected to /challenges/{id}/tags to add tags');
    var noTagsSelected = {
      method: 'POST',
      url: url,
      payload: payloads.noTagsAdded,
      headers: { cookie: `token=${primary_token}` }
    };
    server.inject(noTagsSelected, reply => {
      var orgId = reply.result.orgId;
      t.equal(reply.statusCode, 302, 'select no tags');
      t.equal(reply.headers.location, `/orgs/${orgId}`, 'user is redirected to /orgs/{id} to add tags');
      t.end();
    });
  });
});

tape('/challenges/add (POST) - submit new challenge as a primary_user with one tag only', t => {
  var createNewChallenge = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${primary_token}` }
  };
  var viewSelectedTags = {
    method: 'GET',
    headers: { cookie: `token=${primary_token}` }
  };
  var updateSelectedTags = {
    method: 'POST',
    payload: payloads.addOneTagOnly,
    headers: { cookie: `token=${primary_token}` }
  };
  var viewOrgDetails = {
    method: 'GET',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(createNewChallenge, reply => {
    var challengeId = reply.result.challengeId;
    var url = reply.headers.location;
    t.equal(reply.statusCode, 302, 'challenge created and user is redirected to different view');
    t.equal(url, `/challenges/${challengeId}/tags`, 'user is redirected to /challenges/{id}/tags to add tags');
    viewSelectedTags.url = url;
    updateSelectedTags.url = url;
    server.inject(viewSelectedTags, reply => {
      t.equal(reply.statusCode, 200, 'select-tags-view exists (endpoint: /challenges/{id}/tags)');
      t.ok(reply.payload.indexOf('Select Tags'), 'user is displayed the tag-selection page');
      server.inject(updateSelectedTags, reply => {
        var orgId = reply.result.orgId;
        var url2 = reply.headers.location;
        t.equal(reply.statusCode, 302, 'user selects some tags and is redirected to org view');
        t.equal(url2, `/orgs/${orgId}`, 'user is redirected to /orgs/{id} to add tags');
        viewOrgDetails.url = url2;
        server.inject(viewOrgDetails, reply => {
          t.ok(reply.result.indexOf('GLOBAL PARTNER') > -1, 'challenge is displayed with Global Partners tag');
          t.ok(reply.result.indexOf('USA') === -1, 'challenge is _not_ displayed with USA tag');
          t.end();
        });
      });
    });
  });
});

tape('/challenges/add (POST) - submit new challenge as a primary_user with multiple tags', t => {
  var createNewChallenge = {
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge,
    headers: { cookie: `token=${primary_token}` }
  };
  var viewSelectedTags = {
    method: 'GET',
    headers: { cookie: `token=${primary_token}` }
  };
  var updateSelectedTags = {
    method: 'POST',
    payload: payloads.addTags,
    headers: { cookie: `token=${primary_token}` }
  };
  var viewOrgDetails = {
    method: 'GET',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(createNewChallenge, reply => {
    var challengeId = reply.result.challengeId;
    var url = reply.headers.location;
    t.equal(reply.statusCode, 302, 'challenge created and user is redirected to different view');
    t.equal(url, `/challenges/${challengeId}/tags`, 'user is redirected to /challenges/{id}/tags to add tags');
    viewSelectedTags.url = url;
    updateSelectedTags.url = url;
    server.inject(viewSelectedTags, reply => {
      t.equal(reply.statusCode, 200, 'select-tags-view exists (endpoint: /challenges/{id}/tags)');
      t.ok(reply.payload.indexOf('Select Tags'), 'user is displayed the tag-selection page');
      server.inject(updateSelectedTags, reply => {
        var orgId = reply.result.orgId;
        var url2 = reply.headers.location;
        t.equal(reply.statusCode, 302, 'user selects some tags and is redirected to org view');
        t.equal(url2, `/orgs/${orgId}`, 'user is redirected to /orgs/{id} to add tags');
        viewOrgDetails.url = url2;
        server.inject(viewOrgDetails, reply => {
          t.ok(reply.result.indexOf('GLOBAL PARTNER') > -1, 'challenge is displayed with Global Partners tag');
          t.ok(reply.result.indexOf('USA') > -1, 'challenge is displayed with USA tag');
          t.end();
        });
      });
    });
  });
});

tape('teardown', t => {
  // client.FLUSHDB();
  t.end();
});

tape.onFinish(() => {
  client.end(true);
  server.stop(() => {});
});
