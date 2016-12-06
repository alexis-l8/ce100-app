var Hoek = require('hoek');

module.exports = function (request, reply) {
  var orgId = request.params.id;
  request.server.methods.pg.tags.getForEdit('organisations', orgId, function (pgErr, tags) {
    Hoek.assert(!pgErr, 'Database Error');


    var permissions = require('./helpers.js').getPermissions(request.auth.credentials, 'scope', 'admin');
    var options = Object.assign({ parent_tags: allTags }, permissions);
    reply.view('tags', options);
    
  });
};
