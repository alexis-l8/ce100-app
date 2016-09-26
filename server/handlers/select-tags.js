var Hoek = require('hoek');

module.exports = (request, reply) => {
  var challengeId = request.params.challengeId;
  var payload = request.payload.tags;
  var tags;
  if (payload && payload !== -1) {
    tags = typeof payload === 'string' ? [JSON.parse(payload)] : payload.map(tag => JSON.parse(tag));
  } else tags = [];
  request.redis.LINDEX('challenges', challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    var updatedChallenge = Object.assign(challenge, { tags: tags });
    request.redis.LSET('challenges', challengeId, JSON.stringify(updatedChallenge), (error, response) => {
      Hoek.assert(!error, error);
      reply.redirect(`/orgs/${challenge.org_id}`);
    });
  });
};
