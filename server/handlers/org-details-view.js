var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply) => {
  var orgId = +request.params.id;
  var permissions = helpers.getPermissions(request.auth.credentials, 'organisation_id', orgId);
  if (orgId === -1) {
    return reply.redirect('/orgs');
  }
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);
    if (organisation.primary_id === -1) {
      var options = Object.assign({}, organisation, permissions);
      return reply.view('organisations/details', options);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {first_name, last_name, email, phone, job_title} = JSON.parse(stringifiedPrimaryUser);
      var options = Object.assign({first_name, last_name, email, phone, job_title}, organisation, permissions);
      reply.view('organisations/details', options);
    });
  });
};
