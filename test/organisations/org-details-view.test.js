var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');
var users = ['primary_3', 'secondary_12'];

// use this function to build requests to view different organisation details with different user types
function viewOrgDetails (user, id) {
  return {
    url: '/orgs/' + id,
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}

// test an admin viewing an organisation details
tape('/orgs/id (GET) - Admin view org details view: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      // admin view org with id 1
      server.inject(viewOrgDetails('admin_1', 1), function (res) {

        // Organisation
        // Admin can edit an organisation
        t.ok(res.payload.indexOf('Apple') > -1, 'We get the correct organisation');
        t.ok(res.payload.indexOf('/orgs/1/edit') > -1, 'The admin has edit organisation rights');

        // Primary user
        // Correct user and details are displayed
        t.ok(res.payload.indexOf('Sally Robbins') > -1, 'Organisations primary user is displayed');
        t.ok(res.payload.indexOf('07111111111') > -1, 'Organisations primary user phone number is displayed');
        t.ok(res.payload.indexOf('Athlete') > -1, 'Organisations primary users job title is displayed');
        t.ok(res.payload.indexOf('sa@ro.co') > -1, 'Organisations primary user email is displayed');

        // Challenges
        // We can check the correct challenge name is displayed
        // Admin cannot edit challenges
        t.equal(res.payload.indexOf('/challenges/3/edit'), -1, 'Admin cannot edit the organisations challenge');
        t.ok(res.payload.indexOf('Challenge Number 3') > -1, 'Correct challenge is displayed');

        // Challenges
        t.equal(res.payload.indexOf('/challenges/2/edit'), -1, 'Admin cannot edit the organisations challenge');
        t.ok(res.payload.indexOf('Challenge Number 2') > -1, 'Correct challenge is displayed');
        t.ok(res.payload.indexOf('Go to archived challenges') === -1, 'Admin cannot see archived challenges navigation');

        t.end();
        pool.end();
        server.stop();
      })
    });
  });
});


users.forEach(function (user) {
  var userType = user.split('_')[0];

  // Test a primary user viewing their own organisation
  tape('/orgs/id (GET) - ' + userType + ' user viewing their own organisation: --> ' + __filename, function (t) {
    sessions.addAll(function () {
      initServer(config, function (error, server, pool) {
        // Primary user view their own org with id 1
        server.inject(viewOrgDetails(user, 1), function (res) {

          // Organisation
          // Primary user can edit their own organisation
          userType === 'primary' && t.ok(res.payload.indexOf('/orgs/1/edit') > -1, 'The primary user has edit organisation rights');
          userType === 'secondary' && t.ok(res.payload.indexOf('/orgs/1/edit') === -1, 'The secondary user does not have edit rights');

          // Primary user
          // Correct user and details are displayed
          t.ok(res.payload.indexOf('Sally Robbins') > -1, 'Organisations primary user is displayed');
          t.ok(res.payload.indexOf('07111111111') > -1, 'Organisations primary user phone number is displayed');
          t.ok(res.payload.indexOf('Athlete') > -1, 'Organisations primary users job title is displayed');
          t.ok(res.payload.indexOf('sa@ro.co') > -1, 'Organisations primary user email is displayed');


          // Challenges
          // users can view their own active challenges
          t.ok(res.payload.indexOf('Challenge Number 1') === -1, 'inactive challenges do not show up on org profile');
          t.ok(res.payload.indexOf('Challenge Number 2') > -1, 'active challenges do show up on org profile');
          t.ok(res.payload.indexOf('Challenge Number 3') > -1, 'active challenges do show up on org profile');

          // primary users can edit challenges
          if (userType === 'primary') {
            t.ok(res.payload.indexOf('/challenges/2/edit') > -1, 'Primary user can edit their organisations challenges');
            t.ok(res.payload.indexOf('/challenges/3/edit') > -1, 'Primary user can edit their organisations challenges');
            t.ok(res.payload.indexOf('Archived challenges') > -1, 'Primary user can see archived challenges navigation of own org');
          }

          // secondary users cannot edit challenges
          if (userType === 'secondary') {
            t.ok(res.payload.indexOf('/challenges/2/edit') === -1, 'secondary user cannot edit their organisations challenges');
            t.ok(res.payload.indexOf('/challenges/3/edit') === -1, 'secondary user cannot edit their organisations challenges');
            t.ok(res.payload.indexOf('Go to archived challenges') === -1, 'secondary cannot see archived challenges navigation');
          }

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

users.forEach(function (user) {
  var userType = user.split('_')[0];

  // Test a user viewing a different organisations profile
  tape('/orgs/id (GET) - ' + userType + ' user viewing a different organisation: --> ' + __filename, function (t) {
    sessions.addAll(function () {
      initServer(config, function (error, server, pool) {
        // Secondary/primary user view a different org with id 2
        server.inject(viewOrgDetails(user, 2), function (res) {
          // Organisation
          // Secondary/primary user cannot edit a different organisation
          t.equal(res.payload.indexOf('/orgs/2/edit'), -1, 'The user cannot edit another organisation');

          // Primary user
          // Correct user and details are displayed
          t.ok(res.payload.indexOf('Ben Matthews') > -1, 'Organisations primary user is displayed');
          t.ok(res.payload.indexOf('Awesome') > -1, 'Organisations primary users job title is displayed');
          t.ok(res.payload.indexOf('07111111111') > -1, 'Organisations primary user phone number is displayed');
          t.ok(res.payload.indexOf('be@ma.co') > -1, 'Organisations primary user email is displayed');

          // Challenges
          // We can check the correct challenge name is displayed for org 2
          // Primary cannot edit challenges of different orgs
          t.equal(res.payload.indexOf('/challenges/4/edit'), -1, userType + ' user cannot edit a different organisations challenges');
          t.ok(res.payload.indexOf('Challenge Number 4') > -1, 'Correct challenge is displayed');

          // Challenge Number 5
          t.equal(res.payload.indexOf('/challenges/5/edit'), -1, userType + ' user cannot edit a different organisations challenges');
          t.ok(res.payload.indexOf('Challenge Number 5') > -1, 'Correct challenge with id 5 is displayed');

          // users cannot navigate to archived challengs of a different org
          t.ok(res.payload.indexOf('Go to archived challenges') === -1, 'users cannot see archived challenges navigation in different org');

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

// Test admin and primary user viewing an inactive organisation
tape('/orgs/id (GET) - View inactive org details view: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      // admin view an inactive org with id 7
      server.inject(viewOrgDetails('admin_1', 7), function (res) {
        // Admin can view and edit an inactive organisation
        t.ok(res.payload.indexOf('Coca Cola') > -1, 'Admin can view the correct organisation');
        t.ok(res.payload.indexOf('/orgs/7/edit') > -1, 'The admin has edit organisation rights');
        t.ok(res.payload.indexOf('No people yet.') > -1, 'No primary user is displayed to the admin');

        server.inject(viewOrgDetails('primary_3', 7), function (res) {
          t.equal(res.statusCode, 403, 'org doesnt is not accessible, return 403');

          t.end();
          pool.end();
          server.stop();
        })
      })
    });
  });
});
