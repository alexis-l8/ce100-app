var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  request.redis.LRANGE('organisations', 0, -1, (err, stringifiedOrgs) => {
    Hoek.assert(!err, 'redis error');
    var options = Object.assign({}, helpers.orgsDropdown(stringifiedOrgs), helpers.userTypeRadios(), permissions, {error});
    reply.view('people/add', options).code(error ? 401 : 200);
  });
};
