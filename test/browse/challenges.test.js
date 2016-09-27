var tape = require('tape');
var client = require('redis').createClient();
var server = require('../../server/server.js');
var payloads = require('../helpers/mock-payloads.js');
var setup = require('../helpers/set-up.js');

// Login; add a challenge, check challenge has been added,
// browse challenges view; check generic challenges are there, check that our new challenge isn't there;
// add some filters to browse;
// browse organisations view with same filters, browse organisations without filters;

tape('set up: initialise db', t => {
  setup.initialiseDB(() => {
    require('../../tags/csv-to-json.js')(() => t.end());
  });
});

tape('browse challenges', t => {
  var login = payload => ({
    method: 'POST',
    url: '/login',
    payload: payload
  });
  var browseChallenges = cookie => ({
    method: 'GET',
    url: '/challenges',
    headers: { cookie }
  });
  var addChallenge = cookie => ({
    method: 'POST',
    url: '/challenges/add',
    payload: payloads.addChallenge2,
    headers: { cookie }
  });
  var addTags = cookie => id => ({
    method: 'POST',
    url: `/challenges/${id}/tags`,
    payload: payloads.addTags,
    headers: { cookie }
  });

  var primaryCookie;
  var adminCookie;

  // primary user login
  server.inject(login(payloads.loginPrimary))
    .then(res => {
      t.ok(res.headers['set-cookie'], 'cookie set upon login');
      primaryCookie = res.headers['set-cookie'][0].split(';')[0];
      return server.inject(addChallenge(primaryCookie));
    })
    // primary adds a new challenge
    .then(res => {
      var challengeId = res.result.challengeId;
      t.equal(res.statusCode, 302, 'redirected');
      t.equal(res.headers.location, `/challenges/${challengeId}/tags`);
      return server.inject(addTags(primaryCookie)(challengeId));
    })
    .then(res => {
      t.equal(res.statusCode, 302, 'redirected');
      t.equal(res.headers.location, '/orgs/0');
      return server.inject(browseChallenges(primaryCookie));
    })
    // browse challenges view
    .then(res => {
      t.equal(res.statusCode, 200, '/challenges route returns 200');
      t.ok(res.payload.indexOf('Challenge Number 5') > -1, 'challenges created by other orgs show up');
      t.equal(res.payload.indexOf('Ice Bucket'), -1, 'archived challenges do not show up');
      t.equal(res.payload.indexOf('Challenge Number 1'), -1, 'archived challenges created by my org do not show up');
      t.equal(res.payload.indexOf('Challenge Number 2'), -1, 'challenges created by my org do not show up');
      t.equal(res.payload.indexOf('Challenge Number 3'), -1, 'challenges created by my org do not show up');
      // next we can add filters to the browse
      return server.inject(login(payloads.loginAdmin));
    })
    // admin login
    .then(res => {
      t.ok(res.headers['set-cookie'], 'cookie set upon admin login');
      adminCookie = res.headers['set-cookie'][0].split(';')[0];
      return server.inject(browseChallenges(adminCookie));
    })
    // browse challenges view
    .then(res => {
      t.equal(res.payload.indexOf('Ice Bucket'), -1, 'archived challenges do not show up for admin');
      t.ok(res.payload.indexOf('Challenge Number 2') > -1, 'challenges created by org 0 do show up for admin');
      t.ok(res.payload.indexOf('How to extract oil') > -1, 'newly created challenge shows up');
      var challengeCards = res.payload.split('<div class="card card--challenge">');
      t.ok(challengeCards.length > 5, 'there are more than 4 challenges');
      t.ok(challengeCards[1].indexOf('How to extract oil') > -1, 'newly added challenge card appears at the top');
      t.end();
    })
    .catch(err => {
      console.log('ERROR: ', err);
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
