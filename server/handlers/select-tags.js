var Hoek = require('hoek');

module.exports = (request, reply) => {
  console.log(request.payload);
  var challengeId = request.params.challengeId;
  var payload = request.payload.tags;
  var tags = payload && payload !== -1
    ? (typeof payload === 'string' ? [JSON.parse(payload)] : payload.map(tag => JSON.parse(tag)))
    : [];
  request.redis.LINDEX('challenges', challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    var updatedChallenge = Object.assign(challenge, { tags: tags });
    request.redis.LSET('challenges', challengeId, JSON.stringify(updatedChallenge), (error, response) => {
      Hoek.assert(!error, error);
      console.log(challenge.org_id);
      reply.redirect(`/orgs/${challenge.org_id}`);
    });
  });
};
