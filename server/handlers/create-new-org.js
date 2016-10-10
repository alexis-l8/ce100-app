var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var redis = request.redis;
  redis.LLEN('organisations', (error, length) => {
    Hoek.assert(!error, 'redis error');
    var initialOrgInfo = { name: request.payload.name, mission_statement: '', primary_id: -1, people: [] };
    var orgUpdated = helpers.initialiseEntry(length, initialOrgInfo);
    redis.RPUSH('organisations', orgUpdated, (error, numberOfOrgs) => {
      Hoek.assert(!error, 'redis error');
      reply.redirect('/browse/orgs');
    });
  });
};
