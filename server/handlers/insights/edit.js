'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var iid = request.params.id;
  var updates = request.payload;

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  updates.active = updates.active ? true : false;
  updates.creator_id = loggedIn.userId;
  updates.org_id = loggedIn.organisation_id;
  updates.resource = Object.prototype.hasOwnProperty
    .call(request.payload, 'resources');

  return request.server.methods.pg.insights.edit(iid, updates,
    function (err) {
      Hoek.assert(!err, 'database error');

      return reply.redirect('/insights/' + iid + '/tags');
    });
};
