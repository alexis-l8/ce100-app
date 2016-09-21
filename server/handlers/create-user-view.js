var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    Hoek.assert(!error, 'redis error');
    var options = Object.assign({}, helpers.orgsDropdown(stringifiedOrgs), helpers.userTypeRadios());
    reply.view('people/add', options);
  });
};
