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

tape('get suggested matches (organisations) for challenge card 4', t => {
  var challengeCardId = 3;
  var orgId = initialChallenges[challengeCardId].org_id;
  var viewOrgDetails = (cookie) => ({
    method: 'GET',
    url: `/orgs/${orgId}`,
    headers: { cookie }
  });

  var primaryOfOrg1Login = {
    method: 'POST',
    url: `/login`,
    payload: payloads.primary3Login
  };

  server.inject(viewOrgDetails(`token=${primary_token}`), res => {
    t.equal(res.statusCode, 200, '/orgs/{id} route exists');
    t.equal(res.result.indexOf('EMF'), -1, 'No org suggested as a match to a primary that is not viewing their own org');
    t.equal(res.result.indexOf('BP'), -1, 'No org suggested as a match to a primary that is not viewing their own org');
    t.equal(res.result.indexOf('Apple'), -1, 'No org not suggested as a match to a primary that is not viewing their own org');
    server.inject(primaryOfOrg1Login, res => {
      t.ok(res.headers['set-cookie'], 'cookie set upon login');
      var primary5Cookie = res.headers['set-cookie'][0].split(';')[0];
      server.inject(viewOrgDetails(primary5Cookie), res => {
        t.equal(res.statusCode, 200, '/orgs/{id} route exists');
        t.ok(res.result.indexOf('EMF') > -1, 'correct organisation suggested as a match');
        t.equal(res.result.indexOf('Asda'), -1, 'inactive orgs do not show up for suggested as a match');
        t.ok(res.result.indexOf('BP') > -1, 'correct organisation suggested as a match');
        t.ok(res.result.indexOf('Apple') === -1, 'incorrect organisation not suggested as a match');
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
