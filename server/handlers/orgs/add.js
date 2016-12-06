var Hoek = require('hoek');

module.exports = (request, reply) => {
  request.server.methods.pg.organisations.add(request.payload, function (err, result) {
    Hoek.assert(!err, 'database error');

    return reply.redirect('/orgs');
  });
};
