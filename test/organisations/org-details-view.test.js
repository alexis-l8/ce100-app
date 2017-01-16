var tape = require('tape');
var payloads = require('../helpers/mock-payloads.js');
var initServer = require('../../server/server.js');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '') + ' > ';
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');


// use this function to build requests to view different organisation details with different user types
function viewOrgDetails (user, id) {
  return {
    url: '/orgs/' + id,
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}

// test an admin viewing an organisation details
tape(file + ': Admin view org details view', function (t) {
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

        t.end();
        pool.end();
        server.stop();
      })
    });
  });
});


// Test a primary user viewing their own organisation
tape(file + ': Primary user viewing their own organisation', function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      // Priamary user view their own org with id 1
      server.inject(viewOrgDetails('primary_3', 1), function (res) {

        // Organisation
        // Primary user can edit their own organisation
        t.ok(res.payload.indexOf('/orgs/1/edit') > -1, 'The primary user has edit organisation rights');

        // Primary user
        // Correct user and details are displayed
        t.ok(res.payload.indexOf('Sally Robbins') > -1, 'Organisations primary user is displayed');
        t.ok(res.payload.indexOf('07111111111') > -1, 'Organisations primary user phone number is displayed');
        t.ok(res.payload.indexOf('Athlete') > -1, 'Organisations primary users job title is displayed');
        t.ok(res.payload.indexOf('sa@ro.co') > -1, 'Organisations primary user email is displayed');


        // Challenges
        // Primary users can edit their own organisations challenges
        t.ok(res.payload.indexOf('/challenges/3/edit') > -1, 'Primary user can edit their organisations challenges');
        t.ok(res.payload.indexOf('/challenges/2/edit') > -1, 'Primary user can edit their organisations challenges');


        t.end();
        pool.end();
        server.stop();
      })
    });
  });
});

// Test a primary user viewing a different organisations profile
tape(file + ': Primary user viewing a different organisation', function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      // Priamary user view their own org with id 1
      server.inject(viewOrgDetails('primary_3', 2), function (res) {
        // Organisation
        // Primary user cannot edit a different organisation
        t.equal(res.payload.indexOf('/orgs/2/edit'), -1, 'The primary user cannot edit another organisation');

        // Primary user
        // Correct user and details are displayed
        t.ok(res.payload.indexOf('Ben Matthews') > -1, 'Organisations primary user is displayed');
        t.ok(res.payload.indexOf('Awesome') > -1, 'Organisations primary users job title is displayed');
        t.ok(res.payload.indexOf('07111111111') > -1, 'Organisations primary user phone number is displayed');
        t.ok(res.payload.indexOf('be@ma.co') > -1, 'Organisations primary user email is displayed');



        // Challenges
        // We can check the correct challenge name is displayed for org 2
        // Primary cannot edit challenges
        t.equal(res.payload.indexOf('/challenges/4/edit'), -1, 'Primary user cannot edit a different organisations challenges');
        t.ok(res.payload.indexOf('Challenge Number 4') > -1, 'Correct challenge is displayed');

        // Challenge Number 5
        t.equal(res.payload.indexOf('/challenges/5/edit'), -1, 'Primary user cannot edit a different organisations challenges');
        t.ok(res.payload.indexOf('Challenge Number 5') > -1, 'Correct challenge with id 5 is displayed');



        t.end();
        pool.end();
        server.stop();
      })
    });
  });
});

// Test admin and primary user viewing an inactive organisation
tape(file + ': View inactive org details view', function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      // admin view an inactive org with id 7
      server.inject(viewOrgDetails('admin_1', 7), function (res) {
        // Admin can view and edit an inactive organisation
        t.ok(res.payload.indexOf('Coca Cola') > -1, 'Admin can view the correct organisation');
        t.ok(res.payload.indexOf('/orgs/7/edit') > -1, 'The admin has edit organisation rights');
        t.ok(res.payload.indexOf('No Primary User Yet') > -1, 'No primary user is displayed to the admin');

        server.inject(viewOrgDetails('primary_3', 7), function (res) {
          t.ok(res.payload.indexOf('That organisation does not exist'), -1, 'Primary user cannot view an inactive organisation');

          t.end();
          pool.end();
          server.stop();
        })
      })
    });
  });
});
