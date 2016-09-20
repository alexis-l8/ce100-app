var Hoek = require('hoek');
var Boom = require('boom');
var bcrypt = require('bcrypt');

var helpers = require('./helpers.js');
var R = require('../R.js');

module.exports = (request, reply) => {
  var userId = +request.params.id;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'userId', userId);
  // if incorrect user - reply unauthorized
  if (!permissions.permissions.editable) {
    return reply(Boom.unauthorized('You do not have permission to edit that user.'));
  }
  if (loggedIn.scope === 'primary') {
    // validation will check that if old password is present,
    // then new password and confirm new password are present and equal
    if (request.payload.old_password === '') {
    // if no change to password
      request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
        Hoek.assert(!error, 'redis error');
        var user = JSON.parse(stringifiedUser);
        var newInfo = R.dissocAll(['old_password', 'new_password', 'confirm_new_password'], request.payload);
        var updatedUser = Object.assign({}, user, newInfo);
        // update user
        request.redis.LSET('people', userId, JSON.stringify(updatedUser), (error, response) => {
          Hoek.assert(!error, 'redis error');
          return reply.redirect(`/people/${loggedIn.userId}/edit`);
        });
      });
    } else {
      // the user has changed their password
      // request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
      //   Hoek.assert(!error, 'redis error');
      //   var user = JSON.parse(stringifiedUser);
      //   bcrypt.compare(old_password, user.password, function (error, isValid) {
      //     Hoek.assert(!error, 'bcrypt failure');
      // check that old password correct
      // if incorrect, reply
      // if correct, encrypt new password
      // });
      // });
      reply('ok');
    }
  }
  else { // if (loggedIn.scope === 'admin')


  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    var user = JSON.parse(stringifiedUser);
    var updatedUser = Object.assign({}, user, request.payload);
    // update user
    request.redis.LSET('people', userId, JSON.stringify(updatedUser), (error, response) => {
      Hoek.assert(!error, 'redis error');
      var newOrgId = request.payload.organisation_id;
      var oldOrgId = user.organisation_id;
      // if org unchanged
      if (newOrgId === oldOrgId) {
        return reply.redirect(`/orgs/${user.organisation_id}`);
      }
      // if old org is removed and no new org added -> update old org
      else if (newOrgId === -1) {
        request.redis.LINDEX('organisations', oldOrgId, (error, orgString) => {
          Hoek.assert(!error, 'redis error');
          Hoek.assert(orgString, 'Organisation does not exist');
          var updatedOldOrg = helpers.removeUserFromOrg(orgString, userId);
          request.redis.LSET('organisations', oldOrgId, updatedOldOrg, (error, response) => {
            Hoek.assert(!error, 'redis error');
            return reply.redirect('/people');
          });
        });
      }
      // if user did not have old org but has now been assigned to one
      // eg: oldOrgId: -1, newOrgId: 6
      else { // if (oldOrgId === -1 || oldOrgId === '') { left this here as need to check if there is another case
        request.redis.LINDEX('organisations', newOrgId, (error, newOrgString) => {
          Hoek.assert(!error, 'redis error');
          Hoek.assert(newOrgString, 'Organisation does not exist');
          var updatedOrg = helpers.addPrimaryToOrg(stringifiedUser, newOrgString);
          request.redis.LSET('organisations', newOrgId, updatedOrg, (error, response) => {
            Hoek.assert(!error, 'redis error');
            return reply.redirect('/people');
          });
        });
      }
    });
  });
  }
};
