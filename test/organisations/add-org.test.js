var tape = require('tape');
var config = require('../../server/config.js');
var initServer = require('../../server/server.js');

var sessions = require('../helpers/add-sessions.js');

var adminCookie = { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] };

// use this function to build requests to view different organisation details with different user types
function addOrg (orgObj) {
  return {
    method: 'POST',
    url: '/orgs/add',
    headers: adminCookie,
    payload: orgObj
  };
}

var browseOrgs = {
  url: '/orgs',
  headers: adminCookie
};

// test an admin successfuly adding an organisation
tape('Admin can add an organisation: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      var org = {
        name: 'Experian',
        logo: 'www.experian-image.co.uk'
      };
      server.inject(addOrg(org), function (res) {
        // Admin can add an organisation
        t.equal(res.statusCode, 200, 'Org added and admin is redirected');

        // check the org was actually added
        server.inject(browseOrgs, function (res) {
          t.ok(res.payload.indexOf('Experian') > -1, 'The organisation was added');

          t.end();
          pool.end();
          server.stop();
        })
      });
    });
  });
});



// test an admin successfuly adding an organisation
tape('Admin fails validation on add org view: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      var org = {
        name: '',
        logo_url: 'www.experian-image.co.uk'
      };

      server.inject(addOrg(org), function (res) {
        // Admin cannot add an organisation without a name
        t.equal(res.statusCode, 401, 'org is not added, admin is warned');
        t.ok(res.payload.indexOf('name is not allowed to be empty'), 'Admin is told which field failed validation');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});
