'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var iid = request.params.id;
  var updates = request.payload;
  var tags = helpers.getTagArray(updates.tags);

  if (loggedIn.scope !== 'admin' && loggedIn.scope !== 'content-owner' ) {
    return reply(Boom.forbidden());
  }

  updates.active = Boolean(updates.active);
  updates.creator_id = loggedIn.userId;
  updates.org_id = loggedIn.organisation_id;
  updates.resource = Boolean(updates.resource);

  return request.server.methods.pg.insights.edit(iid, updates,
    function (err) {
      Hoek.assert(!err, 'database error');
      return request.server.methods.pg.tags.addTags('insights', iid,
        tags, function (tagsError) {
          Hoek.assert(!tagsError, 'database error');

          return reply.redirect('/insights');
        });
    });
};
