module.exports = (request, reply) => {
  var permissions = require('./helpers.js').getPermissions(request.auth.credentials, 'scope', 'admin');
  var options = Object.assign({ parent_tags: require('../../tags/tags.json') }, permissions);
  reply.view('tags', options);
};
