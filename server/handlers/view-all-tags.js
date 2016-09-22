var Hoek = require('hoek');

module.exports = (request, reply) => {
  var tags = {
    topics: require('../../tags/topics.json'),
    members: require('../../tags/members.json')
  };
  reply.view('tags', tags);
};
