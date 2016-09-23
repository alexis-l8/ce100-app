var Hoek = require('hoek');
var Boom = require('boom');

module.exports = (request, reply) => {
  var orgId = +request.params.id;
  var loggedIn = request.auth.credentials;
  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    Hoek.assert(stringifiedOrg, 'Organisation does not exist');
    var oldOrg = JSON.parse(stringifiedOrg);
    var orgUpdated = Object.assign({}, oldOrg, request.payload);
    request.redis.LSET('organisations', orgId, JSON.stringify(orgUpdated), (error, response) => {
      Hoek.assert(!error, 'redis error');
      reply(orgUpdated).redirect(`/orgs/${orgId}/tags`);
    });
  });
};
