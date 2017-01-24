'use strict';

var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var aguid = require('aguid');

var helpers = require('../helpers.js');
var config = require('../../config');
var timeOutMessage = 'Your reset password link has expired.' +
  ' Please enter your email address again and follow the link within 5 minutes';


module.exports = function (request, reply) {
  var hashedId = request.params.hashedId;

  jwt.verify(hashedId, config.jwt_secret, function (err, user) {

    // if the token has expired, send the user back to the request-password-reset view
    if (err) {
      var errorMessage =
        err.name === 'TokenExpiredError' ? timeOutMessage : err.message

      return reply.view('request-password-reset', { error: { message: errorMessage } }).code(400);
    }

    var userId = user.id;
    // hash password
    bcrypt.hash(request.payload.password, 13, function (bcryptErr, hashedPassword) {
      Hoek.assert(!bcryptErr, 'bcrypt error');
      request.server.methods.pg.people.addPassword(userId, hashedPassword, function (pgErr, updatedUser) {
        Hoek.assert(!pgErr, 'database errror');
        // if no user was updated
        if (updatedUser.length === 0) {
          var error = {
            message: 'There was a problem activating your account'
          }
          return reply.view('activate', {error}).code(400);
        }

        var session = {
          userId: userId,
          jti: aguid(),
          iat: Date.now()
        };
        request.server.app.redis.HSET('sessions', session.jti, JSON.stringify(session), function (redisErr, res) {
          Hoek.assert(!redisErr, 'redis error');
          var token = jwt.sign(session, config.jwt_secret);
          // redirect a new user with an org to their org profile, else redirect to all orgs
          return updatedUser.org_id === null
          ? reply.redirect('/orgs').state('token', token)
          : reply.redirect('/').state('token', token);
        });
      });
    });
  });
};
