var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, 'redis error');
    Hoek.assert(stringifiedChallenge, 'Challenge does not exist');
    request.redis.LSET('challenges', challengeId, helpers.toggleActivate(stringifiedChallenge), (error, response) => {
      Hoek.assert(!error, 'redis error');
      var challenge = JSON.parse(stringifiedChallenge);
      reply.redirect(`/orgs/${challenge.org_id}`);
    });
  });
};
