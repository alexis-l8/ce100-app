var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var orgId = request.params.id;
  request.server.methods.pg.tags.getTagsForEdit('organisations', orgId, function (pgErr, tags) {
    Hoek.assert(!pgErr, 'Database Error');
    var permissions = helpers.getPermissions(request.auth.credentials, 'scope', 'admin');
    var options = Object.assign({tags}, permissions);

    return reply.view('tags', options);

  });
};
