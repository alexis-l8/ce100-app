'use strict';

var Hoek = require('hoek');

module.exports = function (request, reply) {
  var cid = request.params.id;

  request.server.methods.pg.challenges.toggleActive(cid, function (err, res) {
    Hoek.assert(!err, 'database error');
    console.log(res);
    return reply.redirect('/challenges');
  });
};
