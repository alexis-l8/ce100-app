
var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var userId = request.params.id;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    Hoek.assert(stringifiedUser, 'User does not exist');
    request.redis.LSET('people', userId, helpers.toggleActivateUser(stringifiedUser), (error, response) => {
      Hoek.assert(!error, 'redis error');
      var user = JSON.parse(stringifiedUser);
      // if user has no organisation attached to it, return here
      // if user is going from 'inactive' to 'active' -> do not change the organisation
      if (user.organisation_id === -1 || !user.active) {
        return reply.redirect('/orgs');
      }
      // otherwise user is being deactivated and has a linked org, so deactivate them
      request.redis.LINDEX('organisations', user.organisation_id, (error, orgString) => {
        Hoek.assert(!error, 'redis error');
        Hoek.assert(orgString, 'The linked organisation does not exist');
        var updatedOrg = helpers.removeUserFromOrg(orgString, userId);
        request.redis.LSET('organisations', user.organisation_id, updatedOrg, (error, response) => {
          Hoek.assert(!error, 'redis error');
          return reply.redirect('/orgs');
        });
      });
    });
  });
};
