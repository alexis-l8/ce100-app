var helpers = require('./helpers.js');
module.exports = (request, reply) => {
  console.log(' in handlers ');
  var permissions = helpers.getPermissions(request.auth.credentials);
  var parent_tags = require('../../tags/tags.json');
  var options = Object.assign({}, {parent_tags}, permissions);
  // TODO: reuse views/tags.html view
  reply.view('browse/tags', options);
};
