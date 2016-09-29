var Hoek = require('hoek');
var Iron = require('iron');
// var sendEmail = require('../email.js');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var payload = request.payload;
  var redis = request.redis;
  redis.LLEN('people', (error, length) => {
    Hoek.assert(!error, 'redis error');
    var userUpdated = helpers.initialiseEntry(length, payload);
    redis.RPUSH('people', userUpdated, (error, numberOfUsers) => {
      Hoek.assert(!error, 'redis error');
      var orgId = payload.organisation_id;
      redis.LINDEX('organisations', orgId, (error, org) => {
        Hoek.assert(!error, 'redis error');
        var orgUpdated = helpers.addPrimaryToOrg(userUpdated, org);
        redis.LSET('organisations', orgId, orgUpdated, (error, response) => {
          Hoek.assert(!error, 'redis error');
          Iron.seal(length, process.env.COOKIE_PASSWORD, Iron.defaults, (error, hashed) => {
            Hoek.assert(!error, 'Iron error');
            var newUser = Object.assign({}, payload, {
              organisation_name: JSON.parse(org).name,
              hashedId: hashed
            });
            // sendEmail.newUser(newUser, (error, response) => {
              Hoek.assert(!error, 'Send Email error');
              reply({ userId: length }).redirect('/people');
            // });
          });
        });
      });
    });
  });
};
