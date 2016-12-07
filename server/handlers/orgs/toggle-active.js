var Hoek = require('hoek');

module.exports = function (request, reply) {
  var orgId = request.params.id;

  request.server.methods.pg.organisations.toggleActive(orgId, function (err, response) {
    Hoek.assert(!err, 'database error');
    return reply.redirect('/orgs');
  });
};
