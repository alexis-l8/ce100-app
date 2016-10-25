exports.register = (server, options, next) => {
  server.register(require('hapi-auth-jwt2'));

  var tokenOptions = {
    isSecure: false, // CHANGE ONCE WE KNOW WHETHER THE WEBSITE WILL *DEFINITELY* BE HTTP OR HTTPS
    ttl: 1000 * 60 * 60 * 24 * 30,
    path: '/'
  };
  server.state('token', tokenOptions);
  server.auth.strategy('jwt2', 'jwt', true, {
    key: process.env.JWT_SECRET,
    verifyOptions: { algorithms: ['HS256'] },
    validateFunc: (decoded, request, cb) => {
      request.redis.HGET('sessions', decoded.jti, (err, session) => {
        if(err || !session) {
          return cb(err, false);
        }
        session = JSON.parse(session);
        if (!session.exp) {
          request.redis.LINDEX('people', session.userId, (err, userString) => {
            if (err || !userString) {
              return cb(err, false);
            }
            var user = JSON.parse(userString);
            var override = Object.assign({ scope: user.user_type, organisation_id: user.organisation_id }, decoded);
            return cb(null, true, override);
          });
        }
        else {
          return cb(null, false);
        }
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'auth-strategy'
};
