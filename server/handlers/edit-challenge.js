var Hoek = require('hoek');

module.exports = (request, reply) => {
  var payload = request.payload;
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, error);
    var challenge = JSON.parse(stringifiedChallenge);
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
