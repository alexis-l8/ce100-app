var Hoek = require('hoek');

module.exports = (request, reply) => {
  var orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);

    if (organisation.primary_id === -1) {
      return reply.view('organisations/edit', organisation);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {first_name, last_name, id} = JSON.parse(stringifiedPrimaryUser);
      var organisationDetails = Object.assign({}, organisation, {
        primary_user_name: `${first_name} ${last_name}`,
        primary_user_id: id
      });
      reply.view('organisations/edit', organisationDetails);
    });
  });
};
