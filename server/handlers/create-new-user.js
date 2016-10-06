var Hoek = require('hoek');
var Iron = require('iron');
var sendEmail = require('../email.js');
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
      if (orgId === -1) { // new admin account created
        sendActivationEmail(length, payload, false, userId =>
          reply({ userId: length }).redirect('/people'));
      } else {
        redis.LINDEX('organisations', orgId, (error, org) => {
          Hoek.assert(!error, 'redis error');
          var orgUpdated = helpers.addPrimaryToOrg(userUpdated, org);
          redis.LSET('organisations', orgId, orgUpdated, (error, response) => {
            Hoek.assert(!error, 'redis error');
            sendActivationEmail(length, payload, JSON.parse(org).name, userId =>
              reply({ userId: length }).redirect('/people'));
          });
        });
      }
    });
  });
};

function sendActivationEmail(id, user, organisation_name, callback) {
  Iron.seal(id, process.env.COOKIE_PASSWORD, Iron.defaults, (error, hashedId) => {
    Hoek.assert(!error, 'Iron error');
    var newUser = organisation_name
      ? Object.assign({}, user, { organisation_name }, { hashedId })
      : Object.assign({}, user, { hashedId });
    sendEmail.newUser(newUser, (error, response) => {
      Hoek.assert(!error, 'Send Email error');
      callback({ userId: id });
    });
  });
}
