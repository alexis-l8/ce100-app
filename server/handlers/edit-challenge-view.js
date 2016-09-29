var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply) => {
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    if (challenge.tags.length === 0) {
      reply.view('challenges/edit', challenge);
      return;
    }
    var tags = { tags: helpers.getTagNames(challenge.tags) };
    var permissions = require('./helpers.js').getPermissions(request.auth.credentials, 'scope', 'admin');
    var options = Object.assign({}, challenge, tags, permissions);
    reply.view('challenges/edit', options);
  });
};
