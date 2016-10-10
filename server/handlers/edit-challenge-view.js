var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('./helpers');

module.exports = (request, reply, source, joiErr) => {
  var loggedIn = request.auth.credentials;
  var error = helpers.errorOptions(joiErr);
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (redisErr, stringifiedChallenge) => {
    Hoek.assert(!redisErr, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    var permissions = helpers.getPermissions(loggedIn, 'organisation_id', challenge.org_id);
    if (!permissions.permissions.editable)  {
      reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
      return;
    }
    helpers.getTagNames(request.redis, challenge.tags, tagsData => {
      var options = Object.assign({}, challenge, {tagsData}, permissions, {error});
      reply.view('challenges/edit', options).code(error ? 401 : 200);
    });
  });
};
