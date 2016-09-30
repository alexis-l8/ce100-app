var helpers = require('./helpers.js');
module.exports = (request, reply) => {
  var permissions = helpers.getPermissions(request.auth.credentials);
  var parent_tags = require('../../tags/tags.json');
  var options = Object.assign({}, {parent_tags}, permissions);
  reply.view('browse/tags', options);
};
