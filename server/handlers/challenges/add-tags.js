'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

// we can put this in helpers as it will be used by /challenges/id/tags
function getTagArray (payload) {
  // if no tags were added
  if (payload === undefined) {
    return [];
  }
  // if only 1 tag was added
  if (typeof payload === 'string') {
    return [parseInt(payload, 10)];
  }
  // if more than one tag was added

  return payload.map(function (tag) {
    return parseInt(tag, 10);
  });
}

module.exports = function (request, reply) {
  var challengeId = parseInt(request.params.id, 10);
  var tagsPayload = request.payload.tags;
  var loggedIn = request.auth.credentials;
  var userId = loggedIn.userId;
  var tagsArray = getTagArray(tagsPayload);
  var msg;

  request.server.methods.pg.challenges.checkEditable(userId, challengeId,
    function (pgErr1, editable) {
      Hoek.assert(!pgErr1, 'database error');
      if (!editable) {
        msg = 'You do not have permission to edit that challenge.';

        return reply(Boom.unauthorized(msg));
      }

      return request.server.methods.pg.tags.addTags('challenges', challengeId,
        tagsArray, function (pgErr2) {
          Hoek.assert(!pgErr2, 'database error');

          return reply.redirect('/challenges/' + challengeId);
        });
    });
};
