'use strict';

var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var Boom = require('boom');

var helpers = require('../helpers.js');
var config = require('../../config');
var timeOutMessage = 'Your reset password link has expired.' +
  ' Please enter your email address again and follow the link within 5 minutes';

// we use this handler in activate account and reset password
module.exports = function (userFlow) {
  return function (request, reply, source, joiErr) {
    var error = helpers.errorOptions(joiErr);
    var hashedId = request.params.hashedId;

    // change the following line as we need to encrypt an object with {id: id}
    jwt.verify(hashedId, config.jwt_secret, function (err, user) {

      // if the token has expired, send the user back to the request-password-reset view
      if (err) {
        var errorMessage = err.name === 'TokenExpiredError'
          ? timeOutMessage
          : err.message

        return reply.view('request-password-reset', { error: { message: errorMessage } });
      }

      var userId = user.id;
      // if user is already activated, redirect them to login
      request.server.methods.pg.people.getBy('id', userId, function (pgErr, user) {
        Hoek.assert(!pgErr, 'database error');
        // if no user is found
        if (user.length === 0) {
          return reply(
            Boom.notFound('Something went wrong - we could not find your details')
          );
        }

        // if user is activating their account, we want to do this check
        // if user has already activated
        if (userFlow === 'activate' && user[0].account_activated) {
          return reply.redirect('/login');
        }

        return reply.view('activate', { [userFlow]: true, error: error }).code(error ? 401 : 200);
      });
    });
  };
};
