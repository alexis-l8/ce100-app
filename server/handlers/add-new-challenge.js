var Hoek = require('hoek');

module.exports = (request, reply) => {
  var payload = request.payload;
  var userId = request.auth.credentials.userId;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, error);
    var user = JSON.parse(stringifiedUser);
    var orgId = user.organisation_id;
    request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
      Hoek.assert(!error, error);
      var org = JSON.parse(stringifiedOrg);
      request.redis.LLEN('challenges', (error, challengeId) => {
        Hoek.assert(!error, error);
        user.challenges.push(challengeId);
        org.challenges.push(challengeId);
        var challenge = Object.assign({}, payload, {
          id: challengeId,
          org_id: orgId,
          creator_id: userId,
          date: Date.now(),
          tags: [],
          archived: false
        });
        request.redis.RPUSH('challenges', JSON.stringify(challenge), (error, response) => {
          Hoek.assert(!error, error);
          request.redis.LSET('people', userId, JSON.stringify(user), (error, response) => {
            Hoek.assert(!error, error);
            request.redis.LSET('organisations', orgId, JSON.stringify(org), (error, response) => {
              Hoek.assert(!error, error);
              reply({orgId: orgId}).redirect(`/orgs/${orgId}`);
            });
          });
        });
      });
    });
  });
};
