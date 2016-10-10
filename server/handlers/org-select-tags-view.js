var Hoek = require('hoek');

module.exports = (request, reply) => {
  request.redis.LINDEX('organisations', request.params.id, (error, stringifiedOrg) => {
    Hoek.assert(!error, error);
    var org = JSON.parse(stringifiedOrg);
    var allTags = require('../../tags/tags.json');
    org.tags.forEach((tag, index) => {
      allTags[tag[0]].selected = true;
      allTags[tag[0]].tags[tag[1]].selected = true;
    });
    reply.view('tags', { parent_tags: allTags });
  });
};
