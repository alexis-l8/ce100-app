exports.register = (server, options, next) => {
  server.register(require('hapi-auth-jwt2'));

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
            const override = Object.assign({ scope: user.user_type }, decoded);
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
