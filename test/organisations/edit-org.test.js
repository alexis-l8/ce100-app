var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');

var adminCookie = { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] };

// use these options to view  organisation (id = 1) details
var viewOrg = {
  url: '/orgs/1',
  headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] }
};

// This function allows different user types to edit an organisation.
function editOrg (user, orgObj, orgId) {
  orgId = orgId || 1;
  return {
    method: 'POST',
    url: '/orgs/' + orgId + '/edit',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] },
    payload: orgObj
  }
}

// test an admin editing an organisation details
tape('Admin can edit org --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      var org = {
        name: 'Google',
        mission_statement: 'Work hard',
        tags: "3"
      }

      // admin edit org with id 1
      server.inject(editOrg('admin_1', org), function (res) {

        // Admin can edit an organisation
        t.equal(res.statusCode, 302, 'successful edit redirects');
        t.equal(res.headers.location, '/orgs/1', 'redirected to the organisation');

        server.inject(viewOrg, function (res) {

          // Check the org was updated
          t.equal(res.payload.indexOf('Apple'), -1, 'We get the correct organisation');
          t.ok(res.payload.indexOf('Google') > -1, 'Org name was updated');
          t.ok(res.payload.indexOf('Work hard') > -1, 'Org mission_statement was updated');

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});

// test an admin failing validation editing an organisation details
tape('Admin cannot edit org without a blank name  --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      var org = {
        name: '',
        mission_statement: 'Work hard'
      }

      // admin edit org with id 1
      server.inject(editOrg('admin_1', org), function (res) {

        // Admin cannot edit an organisation with a blank name
        t.equal(res.statusCode, 401, 'unsuccessful edit does not redirect');
        t.ok(res.payload.indexOf('name is not allowed to be empty') > -1, 'error message is returned to admin');


        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});


// test an primary editing an organisation details
// This test is very similar to admin one above.  Primary user cannot edit logo_url or org name
tape('Primary can edit org --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      var org = {
        mission_statement: 'Work hard'
      }

      // admin edit org with id 1
      server.inject(editOrg('primary_3', org), function (res) {

        // Primary user can edit mission_statement of organisation
        t.equal(res.statusCode, 302, 'successful edit redirects');
        t.equal(res.headers.location, '/orgs/1', 'redirected to the organisation');

        server.inject(viewOrg, function (res) {

          // Check the org was updated
          t.ok(res.payload.indexOf('Work hard') > -1, 'Org mission_statement was updated');

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});


tape('Primary cannot edit an org that is not theirs', function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      var org = {
        mission_statement: 'Work hard'
      };

      server.inject(editOrg('primary_3', org, 3), function (res) {
        t.equal(res.statusCode, 403, 'primary cannot edit an org that is not theirs');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
