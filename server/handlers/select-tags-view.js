var Hoek = require('hoek');
var fs = require('fs');
var path = require('path');

module.exports = (request, reply) => {
  request.redis.LINDEX('challenges', request.params.challengeId, (error, stringifiedChallenge) => {
    Hoek.assert(!error, error);
    var challenge = JSON.parse(stringifiedChallenge);
    fs.readFile(path.join(__dirname, '../../tags/tags.json'), 'utf8', (error, data) => {
      Hoek.assert(!error, error);
      var allTags = JSON.parse(data);
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
  });
};
