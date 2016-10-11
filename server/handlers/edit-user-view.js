var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('./helpers.js');

module.exports = (request, reply, source, joiErr) => {
  var loggedIn = request.auth.credentials;
  var userId = parseInt(request.params.id, 10);
  var permissions = helpers.getPermissions(loggedIn, 'userId', userId);
  var error = helpers.errorOptions(joiErr);

  // if incorrect user - reply unauthorized
  if (!permissions.permissions.editable) {
    return reply(Boom.unauthorized('You do not have permission to edit that user.'));
  }

  request.redis.LINDEX('people', userId, (redisErr, stringifiedUser) => {
    Hoek.assert(!redisErr, 'redis error');
    request.redis.LRANGE('organisations', 0, -1, (redisErr, stringifiedOrgs) => {
      Hoek.assert(!redisErr, 'redis error');
      var allOrgs = helpers.orgsDropdown(stringifiedOrgs, stringifiedUser);
      var user = { user: JSON.parse(stringifiedUser) };
      var userTypes = helpers.userTypeRadios(stringifiedUser);
      var options = Object.assign({}, allOrgs, userTypes, user, permissions, {error});
      reply.view('people/edit', options);
    });
  });
};