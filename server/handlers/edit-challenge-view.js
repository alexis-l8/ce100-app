var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply, source, joiErr) => {
  var permissions = helpers.getPermissions(request.auth.credentials, 'scope', 'admin');
  var error = helpers.errorOptions(joiErr);
  var permissions = helpers.getPermissions(request.auth.credentials, 'scope', 'admin');
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (redisErr, stringifiedChallenge) => {
    Hoek.assert(!redisErr, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    helpers.getTagNames(request.redis, challenge.tags, tagsData => {
      var options = Object.assign({}, challenge, {tagsData}, permissions, {error});
      reply.view('challenges/edit', options).code(error ? 401 : 200);
    });
  });
};
