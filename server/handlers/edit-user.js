var Hoek = require('hoek');
var Boom = require('boom');

var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var userId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'userId', userId);

  // if incorrect user - reply unauthorized
  if (!permissions.permissions.editable) {
    return reply(Boom.unauthorized('You do not have permission to edit that user.'));
  }

  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    var user = JSON.parse(stringifiedUser);
    var updatedUser = Object.assign({}, user, request.payload);
    // update user
    request.redis.LSET('people', userId, JSON.stringify(updatedUser), (error, response) => {
      Hoek.assert(!error, 'redis error');

      if (loggedIn.scope === 'primary') {
        return reply.redirect(`/orgs/${loggedIn.organisation_id}`);
      }

      var newOrgId = request.payload.organisation_id;
      var oldOrgId = user.organisation_id;
      // if org unchanged
      if (newOrgId === oldOrgId) {
        return reply.redirect('/people');
      }
      // if old org is removed and no new org added -> update old org
      else if (newOrgId === -1) {
        request.redis.LINDEX('organisations', oldOrgId, (error, orgString) => {
          Hoek.assert(!error, 'redis error');
          Hoek.assert(orgString, 'Organisation does not exist');
          var updatedOldOrg = helpers.removeUserFromOrg(orgString, userId);
          request.redis.LSET('organisations', oldOrgId, updatedOldOrg, (error, response) => {
            Hoek.assert(!error, 'redis error');
            return reply.redirect('/people');
          });
        });
      }
      // if user did not have old org but has now been assigned to one
      // eg: oldOrgId: -1, newOrgId: 6
      else { // if (oldOrgId === -1 || oldOrgId === '') { left this here as need to check if there is another case
        request.redis.LINDEX('organisations', newOrgId, (error, newOrgString) => {
          Hoek.assert(!error, 'redis error');
          Hoek.assert(newOrgString, 'Organisation does not exist');
          var updatedOrg = helpers.addPrimaryToOrg(stringifiedUser, newOrgString);
          request.redis.LSET('organisations', newOrgId, updatedOrg, (error, response) => {
            Hoek.assert(!error, 'redis error');
            return reply.redirect('/people');
          });
        });
      }
    });
  });
};