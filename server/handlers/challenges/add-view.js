var helpers = require('../helpers.js');

var Boom = require('boom');

module.exports = (request, reply, source, joiErr) => {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  if (loggedIn.scope !== 'primary') {
    return reply(Boom.unauthorized('Only Primary users can create challenges'));
  }

  var options = Object.assign({}, permissions, {error});
  return reply.view('challenges/add', options).code(error ? 401 : 200);
};
