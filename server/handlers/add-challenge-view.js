var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  reply.view('challenges/add', permissions);
};
