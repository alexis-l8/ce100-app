var tape = require('tape');
var dir = __dirname.split('/')[__dirname.split('/').length - 1];
var file = dir + __filename.replace(__dirname, '') + ' > ';
var config = require('../../server/config.js');
var initServer = require('../../server/server.js');

var sessions = require('../helpers/add-sessions.js');


// use this function to build requests to view different organisation details with different user types
function addOrg (orgObj) {
  return {
    method: 'POST',
    url: '/orgs/add',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)['admin_1'] },
    payload: orgObj
  };
}

// test an admin successfuly adding an organisation
tape(file + ': Admin can add an organisation', function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {

      var org = {
        name: 'Experian',
        logo_url: 'www.experian-image.co.uk'
      };
      server.inject(addOrg(org), function (res) {
        // Admin can add an organisation
        t.equal(res.statusCode, 302, 'Org added and admin is redirected');

        t.end();
        pool.end();
        server.stop();
      });
    });
  });
});



// test an admin successfuly adding an organisation
tape(file + ': Admin fails validation on add org view', function (t) {
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
