var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    Hoek.assert(stringifiedOrg, 'Organisation does not exist');
    request.redis.LSET('organisations', orgId, helpers.toggleActivate(stringifiedOrg), (error, response) => {
      Hoek.assert(!error, 'redis error');
      var org = JSON.parse(stringifiedOrg);
      // if org has no primary user, return here
      // if org is going from 'inactive' to 'active' -> do not change primary user.
      if (org.primary_id === -1 || !org.active) {
        return reply.redirect('/orgs/browse');
      }
      // otherwise org is being deactivated and has a linked priamry user, so deactivate them
      request.redis.LINDEX('people', org.primary_id, (error, userString) => {
        Hoek.assert(!error, 'redis error');
        Hoek.assert(userString, 'That user does not exist');
        var deactivatedUser = helpers.deactivate(userString);
        request.redis.LSET('people', org.primary_id, deactivatedUser, (error, response) => {
          Hoek.assert(!error, 'redis error');
          return reply.redirect('/orgs/browse');
        });
      });
    });
  });
};
