var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var payload = request.payload;
  var challengeId = request.params.id;
  var loggedIn = request.auth.credentials;
  request.redis.LINDEX('challenges', challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, error);
    var challenge = JSON.parse(stringifiedChallenge);
    var permissions = helpers.getPermissions(loggedIn, 'organisation_id', challenge.org_id);
    if (!permissions.permissions.editable)  {
      reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
      return;
    }
    var updates = {
      title: payload.title,
      description: payload.description
    };
    var options = Object.assign({}, challenge, updates);
    request.redis.LSET('challenges', challengeId, JSON.stringify(options), (error, response) => {
      Hoek.assert(!error, error);
      reply(updates).redirect(`/challenges/${challengeId}/tags`);
    });
  });
};
