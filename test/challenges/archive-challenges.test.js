var tape = require('tape');
var jwt = require('jsonwebtoken');
var client = require('redis').createClient();

var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');
var initialChallenges = require('../helpers/setup/challenges.js')['challenges'];

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

// server.inject - POST overwrite the existing title and description
// server.inject - POST remove 1 tag, add 5 new tags
// server.inject - GET org view - check title, description and tags have been updated.

tape('testing archiving/unarchiving of challenges', t => {
  var challengeCardId = 3;
  var orgId = initialChallenges[challengeCardId].org_id;
  var loadEditView = {
    method: 'GET',
    url: `/challenges/${challengeCardId}/edit`,
    headers: { cookie: `token=${primary_token}` }
  };
  var archiveChallenge = {
    method: 'GET',
    url: `/challenges/${challengeCardId}/toggle-archive`,
    headers: { cookie: `token=${primary_token}` }
  };
  var viewUpdates = {
    method: 'GET',
    headers: { cookie: `token=${primary_token}` }
  };
  server.inject(loadEditView, reply => {
    t.equal(reply.statusCode, 200, 'route exists and replies 200');
    t.ok(reply.result.indexOf(initialChallenges[challengeCardId].title) > -1, 'title has been pre-filled correctly');
    t.ok(reply.result.indexOf(initialChallenges[challengeCardId].description) > -1, 'description has been pre-filled correctly');
    t.ok(reply.result.indexOf('Automotive and Transport Manufacturing') > -1, 'existing tags are correctly displayed');
    t.ok(reply.result.indexOf('Chemicals'), 'existing tags are correctly displayed') > -1;
    t.ok(reply.result.indexOf('Secondary education') > -1, 'existing tags are correctly displayed');
    t.ok(reply.result.indexOf('Design for disassembly') > -1, 'existing tags are correctly displayed');
    server.inject(archiveChallenge, reply => {
      t.equal(reply.statusCode, 302, 'challenge card archived - page redirecting');
      var url = reply.headers.location;
      t.ok(url.indexOf(`/orgs/${orgId}`) > -1, 'redirected to org details view');
      viewUpdates.url = url;
      server.inject(viewUpdates, reply => {
        t.equal(reply.statusCode, 200, 'org details view displays (statusCode 200)');
        t.ok(reply.result.indexOf(initialChallenges[challengeCardId].title) === -1, 'title of challenge card no longer visible');
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
