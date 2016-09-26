module.exports = (request, reply) => {
  reply.view('tags', { parent_tags: require('../../tags/tags.json') });
};
