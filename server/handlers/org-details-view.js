var Hoek = require('hoek');

module.exports = (request, reply) => {
  var orgId = +request.params.id;
  var loggedIn = request.auth.credentials;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);
    if (organisation.primary_id === -1) {
      return reply.view('organisations/details', organisation);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {organisation_id, first_name, last_name, email, phone, job} = JSON.parse(stringifiedPrimaryUser);
      var editable = { editable: loggedIn.organisation_id === orgId || loggedIn.scope === 'admin' };
      var organisationDetails = Object.assign({first_name, last_name, email, phone, job}, organisation, editable);
      reply.view('organisations/details', organisationDetails);
    });
  });
};
