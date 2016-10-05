var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply, source, joiErr) => {
  var permissions = helpers.getPermissions(request.auth.credentials, 'scope', 'admin');
  var error = helpers.errorOptions(joiErr);
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (err, stringifiedChallenge) => {
    Hoek.assert(!err, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    if (challenge.tags.length === 0) {
      var options = Object.assign({}, challenge, permissions, {error});
      reply.view('challenges/edit', options).code(error ? 401 : 200);
      return;
    }
    helpers.getTagNames(request.redis, challenge.tags, tagsData => {
      var options = Object.assign({}, challenge, {tagsData}, permissions, {error});
      reply.view('challenges/edit', options).code(error ? 401 : 200);
    });
  });
};
