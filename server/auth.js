exports.register = (server, options, next) => {
  server.register(require('hapi-auth-jwt2'));

  server.auth.strategy('jwt2', 'jwt', true, {
    key: process.env.JWT_SECRET,
    verifyOptions: { algorithms: ['HS256'] },
    validateFunc: (decoded, request, cb) => {
      request.redis.LINDEX('people', decoded.userId, (err, user) => {
        if (err || !user) {
          return cb(err, null);
        }
        user = JSON.parse(user);

        if (user.active) {
          var override = Object.assign({ scope: user.user_type }, decoded);
          return cb(null, true, override);
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
