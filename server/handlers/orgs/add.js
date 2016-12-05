var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = (request, reply) => {
  request.server.methods.pg.organisations.add(request.payload, function (err, result) {
    Hoek.assert(!err, 'database error');

    return reply.redirect('/orgs');
  });
};
