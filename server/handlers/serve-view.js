var helpers = require('./helpers.js');
module.exports = (viewName) => (request, reply, source, joiErr) => {
  var permissions = helpers.getPermissions(request.auth.credentials, 'scope', 'admin');
  var error = helpers.errorOptions(joiErr);
  var options = Object.assign({}, permissions, {error});
  return reply.view(viewName, options).code(error ? 401 : 200);
};
