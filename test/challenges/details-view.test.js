'use strict';

var test = require('tape');
var init = require('../../server/server.js');
var config = require('../../server/config.js');
var sessions = require('../helpers/add-sessions.js');
var adminToken = sessions.tokens(config.jwt_secret).admin_1;
var primaryToken = sessions.tokens(config.jwt_secret).primary_3;

function challengeView (user, ch_id) {
  return {
    url: '/challenges/' + ch_id,
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}

// admin view active challenge, no suggested matches.
test('Challenge view - active challenge viewed by an admin with no suggested matches: --> ' + __filename, function (t) {
    sessions.addAll(function () {
      init(config, function (err, server, pool) {
        t.ok(!err, 'error starting server' + err);

        server.inject(challengeView('admin_1', 2), function (res) {
          var html = res.payload;

          t.equal(res.statusCode, 200, 'admin can view an active challenge');

          // admin can see the challenge details, and 'no organisations match these tags'

          t.ok(html.indexOf('/challenges/2/edit') === -1, 'Admin cannot edit a challenge');
          t.ok(html.indexOf('Challenge Number 2') > -1, 'Challenge title is displayed');
          t.ok(html.indexOf('How can I...?') > -1, 'Challenge description is displayed');
          t.ok(html.indexOf('Apple') > -1, 'Org that created the challenge is displayed');
          t.ok(html.indexOf('Corporate') > -1, 'Tag associated with the challenge is displayed');
          t.ok(html.indexOf('No organisations match this challenge') > -1,
            'Message indicating that there are no suggested matches for this challenge is displayed');



          t.end();
          pool.end();
          server.stop();
        });
      });
    });
});

// admin view active challenge, with suggested matches.
test('Challenge view - active challenge viewed by an admin with suggested matches: --> '
  + __filename, function (t) {
    sessions.addAll(function () {
      init(config, function (err, server, pool) {
        t.ok(!err, 'error starting server' + err);

        server.inject(challengeView('admin_1', 4), function (res) {
          var html = res.payload;

          // admin can see the challenge details, and 'no organisations match these tags'
          t.ok(html.indexOf('Challenge Number 4') > -1, 'Challenge title is displayed');
          t.ok(html.indexOf('Who should I...?') > -1, 'Challenge description is displayed');
          t.ok(html.indexOf('dwyl') > -1, 'Org that created the challenge is displayed');

          // tags attached to this challenge
          t.ok(html.indexOf('Automotive and Transport Manufacturing') > -1, 'Tag associated with the challenge is displayed');
          t.ok(html.indexOf('Chemicals') > -1, 'Tag associated with the challenge is displayed');
          t.ok(html.indexOf('Secondary education') > -1, 'Tag associated with the challenge is displayed');
          t.ok(html.indexOf('Design for disassembly') > -1, 'Tag associated with the challenge is displayed');

          // suggested matches
          t.ok(html.indexOf('Asda') > -1, 'Correct org suggested as a matche for this challenge');
          t.ok(html.indexOf('EMF') > -1, 'Correct org suggested as a matche for this challenge');
          t.ok(html.indexOf('Co-op Group') > -1, 'Correct org suggested as a matche for this challenge');

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
});


// admin view inactive challenge
test('Challenge view - inactive challenge viewed by an admin: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    init(config, function (err, server, pool) {
      t.ok(!err, 'error starting server' + err);

      server.inject(challengeView('admin_1', 1), function (res) {
        t.equal(res.statusCode, 403, 'admin cannot view an inactive challenge');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});

// primary user that does not belong to the challenge's org cannot view an inactive challenge
test('Challenge view - inactive challenge viewed by a primary: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    init(config, function (err, server, pool) {
      t.ok(!err, 'error starting server' + err);

      server.inject(challengeView('admin_3', 9), function (res) {
        // t.equal(res.statusCode, 403, 'primary cannot view an inactive challenge');
        t.equal(res.statusCode, 302, 'primary cannot view an inactive challenge');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});

var users = ['primary_3', 'secondary_12'];

// test different types of users belonging to the challenge's org can view the challenge and suggested matches
users.forEach(function (user) {
  var userType = user.split('_')[0];

  test('/challenges/{id} - ' + userType + ' challenge details view - user is' +
    ' member of active challenge with suggested matches: --> ' + __filename, function (t) {
      sessions.addAll(function () {
        init(config, function (err, server, pool) {
          t.ok(!err, 'error starting server' + err);

          server.inject(challengeView(user, 3), function (res) {
            var html = res.payload;

            // Check that the edit icon only shows for primary users
            userType === 'primary' && t.ok(html.indexOf('/challenges/3/edit') > -1, 'primary user can see the edit icon when viewing their own challenge');
            userType === 'secondary' && t.ok(html.indexOf('/challenges/3/edit') === -1, 'secondary user cannot see the edit icon when viewing their own challenge');

            // primary can see the challenge details, and 'no organisations match these tags'
            t.ok(html.indexOf('Challenge Number 3') > -1, 'Challenge title is displayed');
            t.ok(html.indexOf('Where can I...?') > -1, 'Challenge description is displayed');
            t.ok(html.indexOf('Apple') > -1, 'Org that created the challenge is displayed');

            // tags attached to this challenge
            t.ok(html.indexOf('Buildings design') > -1, 'Tag associated with the challenge is displayed');
            t.ok(html.indexOf('Fertiliser') > -1, 'Tag associated with the challenge is displayed');
            t.ok(html.indexOf('Waste to energy') > -1, 'Tag associated with the challenge is displayed');

            // suggested matches
            t.ok(html.indexOf('Suggested Matches') > -1, 'Suggested matches shows for ' + userType);
            t.ok(html.indexOf('Co-op Group') > -1, 'Correct org suggested as a match for this challenge');

            t.end();
            pool.end();
            server.stop();
          });
        });
      });
    });
});

// test different types of users not belonging to the challenge's org can view the challenge but not suggested matches
users.forEach(function (user) {
  var userType = user.split('_')[0];

  test('/challenges/{id} - ' + userType + ' viewing challenge details view - challenge from ' +
    'a different org is viewable without suggested matches for a primary user: --> ' + __filename, function (t) {
      sessions.addAll(function () {
        init(config, function (err, server, pool) {
          t.ok(!err, 'error starting server' + err);

          server.inject(challengeView(user, 4), function (res) {
            var html = res.payload;

            t.equal(res.statusCode, 200, userType + ' can view an active challenge');

            // check permissions
            t.ok(html.indexOf('/challenges/4/edit') === -1, userType + ' user cannot edit a challenge not created by their org');
            t.ok(html.indexOf('Suggested Matches') === -1, 'No suggested matches for this challenge are displayed');

            // check challenge details content
            t.ok(html.indexOf('Challenge Number 4') > -1, 'Challenge title is displayed');
            t.ok(html.indexOf('Who should I...?') > -1, 'Challenge description is displayed');
            t.ok(html.indexOf('dwyl') > -1, 'Org that created the challenge is displayed');
            t.ok(html.indexOf('Automotive and Transport Manufacturing') > -1, 'Tag associated with the challenge is displayed');
            t.ok(html.indexOf('Chemicals') > -1, 'Tag associated with the challenge is displayed');
            t.ok(html.indexOf('Design for disassembly') > -1, 'Tag associated with the challenge is displayed');
            t.ok(html.indexOf('Secondary education') > -1, 'Tag associated with the challenge is displayed');

            t.end();
            pool.end();
            server.stop();
          });
        });
      });
  });
});
