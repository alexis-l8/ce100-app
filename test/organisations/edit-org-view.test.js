var tape = require('tape');
var payloads = require('../helpers/mock-payloads.js');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');


// use this function to build requests to view different organisation details with different user types
function editOrgView (user, id) {
  return {
    url: '/orgs/' + id + '/edit',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}

// test differing permissions when viewing edit organisation
tape('Differing permissions on edit org view: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      // admin view org with id 1
      server.inject(editOrgView('admin_1', 1), function (res) {
        t.equal(res.statusCode, 200, '/orgs/id/edit route ok for admin');

        t.ok(res.payload.indexOf('value="Apple') > -1, 'Admin can edit the name of an organisation');
        t.equal(res.payload.indexOf('>Apple AAAA</h1>'), -1, 'Admin cannot see the Org name title indicating that it is editable');

        t.ok(res.payload.indexOf('Organisation\'s mission statement') > -1, 'Admin is given custom label');
        t.ok(res.payload.indexOf('Share your knowledge/experience') > -1, 'Admin can see tags on the organisation');
        t.ok(res.payload.indexOf('/toggle-active') > -1, 'Admin can toggle active an organisation');
        t.ok(res.payload.indexOf('id="primary_user_name"') > -1, 'Admin can see a primary user attached to an organisation');


        // primary id 3 viewing their own org with id 1
        server.inject(editOrgView('primary_3', 1), function (res) {
          t.equal(res.statusCode, 200, '/orgs/id/edit route ok for primary when viewing own organisation');

          // Primary cannot edit org name
          t.equal(res.payload.indexOf('value="Apple'), -1, 'Primary user cannot edit the name of an organisation');
          t.ok(res.payload.indexOf('>Apple AAAA</h1>') > -1, 'Primary user can see the Org name title indicating that it is not editable');

          t.ok(res.payload.indexOf('Add your circular economy vision') > -1, 'Primary user is given custom label for editing mission statement');
          t.ok(res.payload.indexOf('Share your knowledge/experience') > -1, 'Primary user can see tags on the organisation');

          // Primary cannot active their org
          t.equal(res.payload.indexOf('/toggle-active'), -1, 'Admin can toggle active an organisation');
          // Primary cannot see the link to themselves on this view
          t.equal(res.payload.indexOf('id="primary_user_name"'), -1, 'Admin can see a primary user attached to an organisation');


          // finally check that a primary user cannot view the edit org view for a different organisation
          server.inject(editOrgView('primary_3', 2), function (res) {
            t.equal(
              res.statusCode,
              302,
              'Primary user cannot view the edit org view for a different organisation'
            );

            t.end();
            pool.end();
            server.stop();
          });
        });
      });
    });
  });
});


tape('admin can view edit org view when org does not have a primary user attached to it: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(editOrgView('admin_1', 6), function (res) {
        t.equal(res.statusCode, 200, '/orgs/id/edit route exists for org without primary user');
        t.ok(res.payload.indexOf('Asda') > -1, 'server sends back the correct org');
        t.equal(res.payload.indexOf('Primary User'), -1, 'edit org view reacts to having no primary user correctly');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
