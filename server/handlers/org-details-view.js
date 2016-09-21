var Hoek = require('hoek');

module.exports = (request, reply) => {
  var orgId = +request.params.id;
  if (orgId === -1) {
    return reply.redirect('/orgs');
  }
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);
    if (organisation.primary_id === -1) {
      return reply.view('organisations/details', organisation);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {first_name, last_name, email, phone, job} = JSON.parse(stringifiedPrimaryUser);
      var organisationDetails = Object.assign({first_name, last_name, email, phone, job}, organisation);
      reply.view('organisations/details', organisationDetails);
    });
  });
};
