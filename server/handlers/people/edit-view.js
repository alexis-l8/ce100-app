'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var editId = request.params.id && JSON.parse(request.params.id);
  var getBy = request.server.methods.pg.people.getBy;
  var getActiveOrgs = request.server.methods.pg.organisations.getActive;
  var options, msg;

  if (JSON.parse(loggedIn.userId) !== editId && loggedIn.scope !== 'admin') {
    msg = 'You do not have the permissions to edit this user\'s settings';

    return reply(Boom.badRequest(msg));
  }

  return getBy('id', editId, function (pgErr, profile) {
    Hoek.assert(!pgErr, 'database error');
    var user = profile[0];

    getActiveOrgs(function (errorOrgs, orgs) {
      Hoek.assert(!errorOrgs, 'database error');

      options = Object.assign(
        permissions,
        { user: user },
        helpers.userTypeRadios(user.user_type),
        // 1 primary per org for now. So filter out attached orgs
        { orgs: helpers.editUserOrgDropdown(orgs, user) },
        { error: error }
      );

      return reply.view('people/edit', options).code(error ? 401 : 200);
    });
  });
};
