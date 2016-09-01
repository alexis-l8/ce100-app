// setting a cookie from the request.
// request.cookieAuth.set({userId: Number});

// default strategy to be used on each route
// set auth: false in the config on each individual route we do not want authed
exports.register = (server, options, next) => {
  // register hapi-auth-cookie scheme
  server.register(require('hapi-auth-cookie'));

  server.auth.strategy('initial', 'cookie', false, {
    // true -> auth is default, false ->  auth is not used
    password: process.env.COOKIE_PASSWORD,
    redirectTo: '/login',
    cookie: 'session',
    ttl: 1000 * 60 * 60 * 24 * 7,
    keepAlive: true,
    isSecure: false,
    validateFunc: (request, session, cb) => {
      // session holds the decoded object of form { userId: Number }
      // check that the users id is in the db and that the user is active
      request.redis.LINDEX('people', session.userId, (err, userString) => {
        if (err) { return cb(err, null); }
        else if (!userString) { return cb(null, false); }
        const user = JSON.parse(userString);
        if (user.active) {
          // add scope === user_type to be accessed by the route handler
          session.scope = user.user_type;
          return cb(null, true);
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
