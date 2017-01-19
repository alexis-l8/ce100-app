'use strict';

var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var Boom = require('boom');
var bcrypt = require('bcrypt');
var aguid = require('aguid');

var helpers = require('../helpers.js');
var config = require('../../config');

module.exports = function (request, reply) {
  var hashedId = request.params.hashedId;

  var userId = jwt.verify(hashedId, config.jwt_secret);
  // hash password
  bcrypt.hash(request.payload.password, 13, function (bcryptErr, hashedPassword) {
    Hoek.assert(!bcryptErr, 'bcrypt error');
    request.server.methods.pg.people.addPassword(userId, hashedPassword, function (pgErr, updatedUser) {
      Hoek.assert(!pgErr, 'database errror');
      // if no user was updated
      if (updatedUser.length === 0) {
        var error = {
          message: 'There was a problem activating your account'
        };
        return reply.view('activate', {error}).code(401);
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
};
