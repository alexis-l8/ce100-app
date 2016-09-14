var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var Iron = require('iron');
var aguid = require('aguid');
var helpers = require('./helpers.js');

/// TODO: fix session

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
        request.redis.LSET('people', userId, updatedUser, (error, response) => {
          Hoek.assert(!error, 'redis error');
          var token = jwt.sign({userId: userId}, process.env.JWT_SECRET);
          reply.redirect('/').state('token', token);
        });
      });
    });
  });
};
