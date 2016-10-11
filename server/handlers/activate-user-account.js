var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var Iron = require('iron');
var aguid = require('aguid');
var helpers = require('./helpers.js');
var bcrypt = require('bcrypt');

module.exports = (request, reply) => {
  var hashedId = request.params.hashedId;
  Iron.unseal(hashedId, process.env.COOKIE_PASSWORD, Iron.defaults, (error, userId) => {
    Hoek.assert(!error, 'Iron error');
    // hash password
    bcrypt.hash(request.payload.password, 13, function (error, hashedPassword) {
      Hoek.assert(!error, 'bcrypt error');
      request.redis.LINDEX('people', userId, (error, user) => {
        Hoek.assert(!error, 'redis error');
        var updatedUser = helpers.addPasswordToUser(hashedPassword, user);
        request.redis.LSET('people', userId, JSON.stringify(updatedUser), (error, response) => {
          Hoek.assert(!error, 'redis error');
          var session = {
            userId: userId,
            jti: aguid(),
            iat: Date.now()
          };
          request.redis.HSET('sessions', session.jti, JSON.stringify(session), (error, res) => {
            Hoek.assert(!error, 'redis error');
            var token = jwt.sign(session, process.env.JWT_SECRET);
            // redirect a new user with an org to their org profile, else redirect to all orgs
            return updatedUser.organisation_id > -1
              ? reply.redirect(`/orgs/${updatedUser.organisation_id}`).state('token', token)
              : reply.redirect('/browse/orgs').state('token', token);
          });
        });
      });
    });
  });
};
