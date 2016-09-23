var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply) => {
  var orgId = +request.params.id;
  var permissions = helpers.getPermissions(request.auth.credentials, 'organisation_id', orgId);
  if (orgId === -1) {
    return reply.redirect('/orgs');
  }
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    // TODO: catch for case where org at specified userId doesn't exist.
    var organisation = JSON.parse(stringifiedOrg);
    if (organisation.primary_id === -1 && organisation.challenges.length === 0) {
      return reply.view('organisations/details', { organisation: organisation });
    } else {
      var orgDetails = { organisation: organisation };
      request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
        Hoek.assert(!error, 'redis error');
        var {first_name, last_name, email, phone, job} = JSON.parse(stringifiedPrimaryUser);
        orgDetails.primary_user = Object.assign({first_name, last_name, email, phone, job}, organisation);
        if (organisation.challenges.length > 0) {
          request.redis.LRANGE('challenges', 0, -1, (error, challenges) => {
            Hoek.assert(!error, 'redis error');
            orgDetails.challenges = organisation.challenges.map(challengeId => {
              return JSON.parse(challenges[challengeId]);
            });
            reply.view('organisations/details', orgDetails);
          });
        } else {
          orgDetails.challenges = false;
          reply.view('organisations/details', orgDetails);
        }
      });
    }
  });
};
