var tape = require('tape');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var client = require('redis').createClient();

var payloads = require('../helpers/mock-payloads.js');
var allTags = JSON.parse(fs.readFileSync(path.join(__dirname, '../../tags/ORIGINAL.json'), 'utf8'));
var setup = require('../helpers/set-up.js');
var initialChallenges = require('../helpers/setup/challenges.js')['challenges'];

var sessions = require('../helpers/setup/sessions.js')['sessions'];
var admin_token = jwt.sign(sessions[0], process.env.JWT_SECRET);
var primary_token = jwt.sign(sessions[2], process.env.JWT_SECRET);
var server;

tape('set up: initialise db', t => {
  setup.initialiseDB(function (initServer) {
    server = initServer;
    t.end();
  });
});

tape('testing archiving/unarchiving of challenges', t => {
  var challengeCardId = 2;
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
    // QUESTION FOR @JMURPHYWEB AND @NELSONIC --> we're reading in the json file (functionality that we've replaced with drawing data out from redis)
    // Is it ok that we're still doing this here, just for testing purposes? Might we get unexpected effects (like that experienced with caching),
    // and would it therefore be an _inaccurate_ test of what we're trying to achieve?
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
