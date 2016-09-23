var Hoek = require('hoek');

module.exports = (request, reply) => {
  var orgId = request.params.id;
  var payload = request.payload.tags;
  var tags;
  if (payload && payload !== -1) {
    tags = typeof payload === 'string' ? [JSON.parse(payload)] : payload.map(tag => JSON.parse(tag));
  } else tags = [];
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var org = JSON.parse(stringifiedOrg);
    var updatedOrg = Object.assign(org, { tags: tags });
    request.redis.LSET('organisations', orgId, JSON.stringify(updatedOrg), (error, response) => {
      Hoek.assert(!error, error);
      reply.redirect(`/orgs/${org.id}`);
    });
  });
};
