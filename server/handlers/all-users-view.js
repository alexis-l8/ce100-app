var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  request.redis.LRANGE('people', 0, -1, (error, stringifiedUsers) => {
    Hoek.assert(!error, 'redis error');
    request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
      Hoek.assert(!error, 'redis error');
      var orgs = stringifiedOrgs.map(element => JSON.parse(element));
      var users = stringifiedUsers.map(u => {
        var user = JSON.parse(u);
        var additionalInfo = {
          organisation_id: user.organisation_id > -1
            ? orgs[user.organisation_id].name
            : false
        };
        return Object.assign(additionalInfo, user);
      });
      // TODO: Can this navbar logic go somewhere else?
      var allUsers = {
        allUsers: users,
        alternate: [{
          path: '/people/add',
          name: '+'
        }, {
          path: '/orgs',
          name: 'Orgs'
        }]
      };
      reply.view('people/view', allUsers);
    });
  });
};
