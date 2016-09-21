var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var userId = request.params.id;
  request.redis.LINDEX('people', userId, (error, stringifiedUser) => {
    Hoek.assert(!error, 'redis error');
    request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
      Hoek.assert(!error, 'redis error');
      var allOrgs = helpers.orgsDropdown(stringifiedOrgs, stringifiedUser);
      var user = { user: JSON.parse(stringifiedUser) };
      var userTypes = helpers.userTypeRadios(stringifiedUser);
      var options = Object.assign({}, allOrgs, userTypes, user);
      reply.view('people/edit', options);
    });
  });
};
