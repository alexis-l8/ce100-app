var Hoek = require('hoek');

module.exports = (request, reply) => {
  var challengeId = request.params.challengeId;
  var payload = request.payload.tags;
  var tags;
  if (payload && payload !== -1) {
    tags = typeof payload === 'string' ? [JSON.parse(payload)] : payload.map(tag => JSON.parse(tag));
  } else tags = [];
  request.redis.LINDEX('challenges', challengeId, (redisErr, stringifiedChallenge) => {
    Hoek.assert(!redisErr, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    var updatedChallenge = Object.assign(challenge, { tags: tags });
    request.redis.LSET('challenges', challengeId, JSON.stringify(updatedChallenge), (redisErr, response) => {
      Hoek.assert(!redisErr, 'redis error');
      reply({ orgId: challenge.org_id }).redirect(`/orgs/${challenge.org_id}`);
    });
  });
};
