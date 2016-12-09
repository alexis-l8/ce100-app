var Hoek = require('hoek');
var config = require('../../config');
var jwt = require('jsonwebtoken');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);
  var hashedId = request.params.hashedId;
  var userId = jwt.verify(hashedId, config.jwt_secret).userId;

  // if user is already activated, redirect them to login
  request.server.methods.pg.people.getById(userId, function (pgErr, user) {
    Hoek.assert(!pgErr, 'database error');

    // if no user is found
    if (user.length === 0) {
      return reply(Boom.notFound('Something went wrong - we could not find your details'));
    }

    // if user has already activated
    if (user[0].account_activated) {
      return reply.redirect('/login');
    }

    return reply.view('activate', {error}).code(error ? 401 : 200);
  });
};
