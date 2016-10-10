var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');

  request.redis.LRANGE('people', 0, -1, (error, stringifiedUsers) => {
    Hoek.assert(!error, 'redis error');
    request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
      Hoek.assert(!error, 'redis error');
      var allUsers = attachOrgsToUsers(stringifiedOrgs, stringifiedUsers);
      var users;
      if (loggedIn.scope === 'admin') {
        var admins = allUsers.filter(el => el.user_type === 'admin');
        var nonAdmins = allUsers.filter(el => el.user_type !== 'admin');
        var sortedNonAdmins = helpers.sortAlphabetically('first_name')(nonAdmins);
        users = admins.concat(sortedNonAdmins);
      } else {
        users = helpers.sortAlphabetically('first_name')(filterActiveAndAdmin(allUsers));
      }
      var options = Object.assign({}, {allUsers: users}, permissions);
      reply.view('people/view', options);
    });
  });
};

function filterActiveAndAdmin (arr) {
  return arr.filter(el => el.active && el.user_type !== 'admin');
}

function attachOrgsToUsers (stringifiedOrgs, stringifiedUsers) {
  var orgs = stringifiedOrgs.map(element => JSON.parse(element));
  return stringifiedUsers.map(u => {
    var user = JSON.parse(u);
    var additionalInfo = {
      organisation_name: user.organisation_id > -1
        ? orgs[user.organisation_id].name
        : false
    };
    return Object.assign(additionalInfo, user);
  });
}
