var tape = require('tape');
var jwt = require('jsonwebtoken');
var client = require('redis').createClient();

var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var allTags = require('../../tags/tags.json');
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

tape('testing archiving/unarchiving of challenges', t => {
  var challengeCardId = 3;
  var challengeCardDetails = initialChallenges[challengeCardId];
  var orgId = challengeCardDetails.org_id;
  var tags = challengeCardDetails.tags;
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
    t.ok(reply.result.indexOf(challengeCardDetails.title) > -1, 'title has been pre-filled correctly');
    t.ok(reply.result.indexOf(challengeCardDetails.description) > -1, 'description has been pre-filled correctly');
    tags.forEach(tag => {
      var tagName = allTags[tag[0]].tags[tag[1]].name;
      t.ok(reply.result.indexOf(tagName) > -1, 'existing tags are correctly displayed');
    });
    server.inject(archiveChallenge, reply => {
      t.equal(reply.statusCode, 302, 'challenge card archived - page redirecting');
      var url = reply.headers.location;
      t.ok(url.indexOf(`/orgs/${orgId}`) > -1, 'redirected to org details view');
      viewUpdates.url = url;
      server.inject(viewUpdates, reply => {
        t.equal(reply.statusCode, 200, 'org details view displays (statusCode 200)');
        t.ok(reply.result.indexOf(challengeCardDetails.title) === -1, 'title of challenge card no longer visible');
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
