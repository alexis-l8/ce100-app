module.exports = (viewName) => (request, reply) => {

  var permissions = require('./helpers.js').getPermissions(request.auth.credentials, 'scope', 'admin');
  return reply.view(viewName, permissions);
};
