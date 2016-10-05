var helpers = require('./helpers.js');
var Hoek = require('hoek');
var Iron = require('iron');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);
  var hashedId = request.params.hashedId;
  Iron.unseal(hashedId, process.env.COOKIE_PASSWORD, Iron.defaults, (ironErr, userId) => {
    Hoek.assert(!ironErr, 'Iron error');
    request.redis.LINDEX('people', userId, (redisErr, userString) => {
      Hoek.assert(!redisErr, 'redis error');
      var user = JSON.parse(userString);
      if (user.last_login) {
        return reply.redirect('/login');
      }
      return reply.view('activate', {error}).code(error ? 401 : 200);
    });
  });
};
