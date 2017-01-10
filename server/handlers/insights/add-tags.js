'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

function getTagArray (payload) {
  // if no tags are added
  if (payload === undefined) {
    return [];
  }
  // if only 1 tag is added
  if (typeof payload === 'string') {
    return [parseInt(payload, 10)];
  }
  // if more than one tag is added

  return payload.map(function (tag) {
    return parseInt(tag, 10);
  });
}

module.exports = function (request, reply) {
  var insightId = parseInt(request.params.id, 10);
  var tagsPayload = request.payload.tags;
  var loggedIn = request.auth.credentials;
  var tagsArray = getTagArray(tagsPayload);

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.tags.addTags('insights', insightId,
    tagsArray, function (pgErr2) {
      Hoek.assert(!pgErr2, 'database error');

      return reply.redirect('/insights');
    });
};
