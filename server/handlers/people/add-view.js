var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  request.server.methods.pg.organisations.getActive(function (pgErr, orgs) {
    Hoek.assert(!pgErr, 'database error');
    // for now we can remove all orgs that aren't linked to a primary user
    // this filtering can be done on the front end when we introduce secondary users
    var unlinkedActiveOrgs = orgs.filter(removeLinked);
    var options = Object.assign({},
      {orgs: unlinkedActiveOrgs},
      helpers.userTypeRadios(),
      permissions,
      {error}
    );

    return reply.view('people/add', options).code(error ? 401 : 200);
  });
};

function removeLinked (org) {
   return org.active_primary_user === null;
}
