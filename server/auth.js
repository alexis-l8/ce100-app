exports.register = (server, options, next) => {
  server.register(require('hapi-auth-jwt2'));

  server.auth.strategy('jwt2', 'jwt', true, {
    key: process.env.JWT_SECRET,
    verifyOptions: { algorithms: ['HS256'] },
    validateFunc: (decoded, request, cb) => {
      request.redis.LINDEX('people', decoded.userId, (err, userString) => {
        if (err) { return cb(err, null); }
        else if (!userString) { return cb(null, false); }
        const user = JSON.parse(userString);
        if (user.active) {
          const override = Object.assign({ scope: user.user_type }, decoded);
          return cb(null, true, override);
        }
        else { return cb(null, false); }
      });
    }
  });

  return next();
};

exports.register.attributes = {
  name: 'auth-strategy'
};
