var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var Boom = require('boom');

var helpers = require('../helpers.js');
var config = require('../../config');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);
  var hashedId = request.params.hashedId;

  var userId = jwt.verify(hashedId, config.jwt_secret);

  // if user is already activated, redirect them to login
  request.server.methods.pg.people.getBy('id', userId, function (pgErr, user) {
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
