var Hoek = require('hoek');
var Boom = require('boom');
var jwt = require('jsonwebtoken');
var aguid = require('aguid');
var bcrypt = require('bcrypt');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var redis = request.redis;
  var email = request.payload.email;
  var password = request.payload.password;
  redis.LRANGE('people', 0, -1, (error, allUsers) => {
    Hoek.assert(!error, 'redis error');
    var user = allUsers.filter(eachUser => JSON.parse(eachUser).email === email);
    if (user.length === 0) {
      return reply(Boom.unauthorized('Sorry, that email has not been registered.'));
    }
    var userDetails = JSON.parse(user[0]);
    bcrypt.compare(password, userDetails.password, function (error, isValid) {
      Hoek.assert(!error, 'bcrypt failure');
      if (!isValid) {
        return reply(Boom.unauthorized('Sorry, that password is invalid, please try again.'));
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
          return userDetails.user_type === 'primary'
            ? reply.redirect(`/orgs/${userDetails.organisation_id}`).state('token', token)
            : reply.redirect('/orgs').state('token', token);
        });
      });
    });
  });
};
