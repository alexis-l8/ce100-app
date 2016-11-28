'use strict';

var hapiAuthJwt = require('hapi-auth-jwt2');

var tokenOptions = {
  isSecure: false, // CHANGE ONCE WE KNOW WHETHER THE WEBSITE WILL *DEFINITELY* BE HTTP OR HTTPS
  ttl: 1000 * 60 * 60 * 24 * 30,
  path: '/'
};

exports.register = function (server, options, next) {
  server.register(hapiAuthJwt);

  server.state('token', tokenOptions);
  server.auth.strategy('jwt2', 'jwt', true, {
    key: process.env.JWT_SECRET,
    verifyOptions: { algorithms: ['HS256'] },
    validateFunc: function (decoded, request, cb) {
      request.server.app.redis.HGET('sessions', decoded.jti, function (err, sessionStr) { // eslint-disable-line
        var session;

        if (err) {
          return cb(err, false);
        }
        if (!sessionStr) {
          return cb(null, false);
        }
        session = JSON.parse(sessionStr);

        // if session has been expired
        if (session.exp) {
          return cb(null, false);
        }

        return request.server.methods.pg.people.getBy('id', session.userId, function (pgErr, pgUser) { //eslint-disable-line
          var user;

          if (pgErr || pgUser.length === 0) {
            return cb(err, false);
          }
          user = pgUser[0];

          // if the user has not activated account
          if (!user.account_activated) {
            return cb(null, false);
          }

          var override = Object.assign({ scope: user.user_type, organisation_id: user.organisation_id }, decoded); //eslint-disable-line

          return cb(null, true, override);
        });
      });
    }
  });

  return next();
};

exports.register.attributes = { name: 'auth-strategy' };
