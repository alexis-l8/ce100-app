var Hoek = require('hoek');
var fs = require('fs');
var path = require('path');

module.exports = (request, reply) => {
  request.redis.LINDEX('organisations', request.params.id, (error, stringifiedOrg) => {
    Hoek.assert(!error, error);
    var org = JSON.parse(stringifiedOrg);
    request.redis.HGET('tags', 'tags', (error, data) => {
      Hoek.assert(!error, error);
      var allTags = JSON.parse(data);
      if (org.tags) {
        org.tags.forEach((tag, index) => {
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
