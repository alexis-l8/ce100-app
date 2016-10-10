var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);

  request.redis.LINDEX('challenges', request.params.challengeId, (redisErr, stringifiedChallenge) => {
    Hoek.assert(!redisErr, error);
    var challenge = JSON.parse(stringifiedChallenge);
    request.redis.HGET('tags', 'tags', (redisErr, data) => {
      Hoek.assert(!redisErr, 'redis error');

      var allTags = JSON.parse(data);
      if (challenge.tags) {
        challenge.tags.forEach((tag, index) => {
          allTags[tag[0]].selected = true;
          allTags[tag[0]].tags[tag[1]].selected = true;
        });
      }
      var permissions = require('./helpers.js').getPermissions(request.auth.credentials, 'scope', 'admin');
      var options = Object.assign({ parent_tags: allTags }, permissions, {error});
      reply.view('tags', options).code(error ? 401 : 200);
    });
  });
};
