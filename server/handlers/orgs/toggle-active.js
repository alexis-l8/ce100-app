var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var orgId = request.params.id;

  request.server.methods.pg.organisations.toggleActive(orgId, function (err, response) {
    Hoek.assert(!err, 'database error');
    return reply.redirect('/orgs');
  });
};
