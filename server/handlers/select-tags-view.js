var Hoek = require('hoek');

module.exports = (request, reply) => {
  request.redis.LINDEX('challenges', request.params.challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, error);
    var challenge = JSON.parse(stringifiedChallenge);
    var allTags = require('../../tags/tags.json');
    if (challenge.tags) {
      challenge.tags.forEach((tag, index) => {
        allTags[tag[0]].selected = true;
        allTags[tag[0]].tags[tag[1]].selected = true;
      });
    }
    var permissions = require('./helpers.js').getPermissions(request.auth.credentials, 'scope', 'admin');
    var options = Object.assign({ parent_tags: allTags }, permissions);
    reply.view('tags', options);
  });
};
