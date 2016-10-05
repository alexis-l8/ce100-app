var helpers = require('./helpers.js');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var options = Object.assign({}, permissions, {error});
  reply.view('challenges/add', options).code(error ? 401 : 200);
};
