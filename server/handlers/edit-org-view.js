var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('./helpers.js');

module.exports = (request, reply, source, joiErr) => {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  var error = helpers.errorOptions(joiErr);
  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }

  request.redis.LINDEX('organisations', orgId, (redisErr, stringifiedOrg) => {
    Hoek.assert(!redisErr, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);
    var organisationTags = helpers.getTagNames(organisation.tags);
    organisation.tags = organisationTags;

    if (organisation.primary_id === -1) {
      var options = Object.assign({}, organisation, permissions, {error});
      return reply.view('organisations/edit', options);
    }
    request.redis.LINDEX('people', organisation.primary_id, (redisErr, stringifiedPrimaryUser) => {
      Hoek.assert(!redisErr, 'redis error');
      var {first_name, last_name, id} = JSON.parse(stringifiedPrimaryUser);
      var options = Object.assign({}, organisation, {
        primary_user_name: `${first_name} ${last_name}`,
        primary_user_id: id
      }, permissions, {error});
      reply.view('organisations/edit', options);
    });
  });
};
