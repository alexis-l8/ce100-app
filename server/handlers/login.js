var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var aguid = require('aguid');
var bcrypt = require('bcrypt');

module.exports = (request, reply) => {
  var redis = request.redis;
  var email = request.payload.email;
  var password = request.payload.password;
  redis.LRANGE('people', 0, -1, (error, allUsers) => {
    Hoek.assert(!error, 'redis error');
    var user = allUsers.filter(eachUser => JSON.parse(eachUser).email === email);
    if (user.length === 0) {
      return reply.view('login', {error: rejectLogin(request.payload)}).code(401);
    }
    var userDetails = JSON.parse(user[0]);
    bcrypt.compare(password, userDetails.password, function (error, isValid) {
      Hoek.assert(!error, 'bcrypt failure');
      if (error || !isValid) {
        return reply.view('login', {error: rejectLogin(request.payload)}).code(401);
      }
      userDetails.last_login = Date.now();
      redis.LSET('people', userDetails.id, JSON.stringify(userDetails), (error, response) => {
        Hoek.assert(!error, 'redis error');
        var session = {
          userId: userDetails.id, // duh
          jti: aguid(),   // random UUID
          iat: Date.now() // session creation time (start)
        };
        redis.HSET('sessions', session.jti, JSON.stringify(session), (error, res) => {
          Hoek.assert(!error, 'redis error');
          var token = jwt.sign(session, process.env.JWT_SECRET);
          return reply.redirect('/browse/orgs').state('token', token);
        });
      });
    });
  });
};

function rejectLogin (values) {
  return {
    message: 'Sorry, that email or password is incorrect. Please try again.',
    values
  };
}
