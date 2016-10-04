var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);
  var challengeId = request.params.id;
  request.redis.LINDEX('challenges', challengeId, (err, stringifiedChallenge) => {
    Hoek.assert(!err, 'redis error');
    var challenge = JSON.parse(stringifiedChallenge);
    var tagsData = helpers.getTagNames(challenge.tags);
    var permissions = helpers.getPermissions(request.auth.credentials, 'scope', 'admin');
    var options = Object.assign({}, challenge, {tagsData}, permissions, {error});
    reply.view('challenges/edit', options).code(error ? 401 : 200);
  });
};
