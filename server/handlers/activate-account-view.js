
var Hoek = require('hoek');
var Iron = require('iron');

module.exports = (request, reply) => {
  var hashedId = request.params.hashedId;
  Iron.unseal(hashedId, process.env.COOKIE_PASSWORD, Iron.defaults, (error, userId) => {
    Hoek.assert(!error, 'Iron error');
    request.redis.LINDEX('people', userId, (error, userString) => {
      Hoek.assert(!error, 'redis error');
      var user = JSON.parse(userString);
      if (user.last_login) {
        return reply.redirect('/login');
      }
      return reply.view('activate');
    });
  });
};
