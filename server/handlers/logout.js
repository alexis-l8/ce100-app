
module.exports = (request, reply) => {
  var userId = request.auth.credentials.userId;
  // deactivate token -> need to confirm with nelson how to do this.
  reply.redirect('/').state('token', 'null');
};
