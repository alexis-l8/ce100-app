var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }

  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);
    var organisationTags = organisation.tags && helpers.getTagNames(organisation.tags);
    organisation.tags = organisationTags;

    if (organisation.primary_id === -1) {
      var options = Object.assign({}, organisation, permissions);
      return reply.view('organisations/edit', options);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {first_name, last_name, id} = JSON.parse(stringifiedPrimaryUser);
      var options = Object.assign({}, organisation, {
        primary_user_name: `${first_name} ${last_name}`,
        primary_user_id: id
      }, permissions);
      reply.view('organisations/edit', options);
    });
  });
};
