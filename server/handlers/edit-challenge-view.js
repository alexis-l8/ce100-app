var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply) => {
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    if (challenge.tags.length === 0) {
      return reply.view('challenges/edit', challenge);
    } else {
      var tags = { tags: helpers.getTagNames(challenge.tags) };
      var options = Object.assign({}, challenge, tags);
      reply.view('challenges/edit', options);
    }
  });
};
