var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var challengeId = parseInt(request.params.challengeId, 10);
  var tagsPayload = request.payload.tags;
  var loggedIn = request.auth.credentials;
  var userId = loggedIn.userId
  var tagsArray = getTagArray(tagsPayload);

  request.server.methods.pg.challenges.checkEditable(userId, challengeId, function (pgErr, editable) {
    // check if user has permission to edit a challenge
    if (!editable) {
      return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
    }

    request.server.methods.pg.tags.addTags('challenges', challengeId, tagsArray, function (pgErr, res) {
      Hoek.assert(!pgErr, 'database error');
      return reply.redirect('/challenges/' + challengeId);
    });
  });
};

// we can put this in helpers as it will be used by /challenges/id/tags
function getTagArray (payload) {
  // if no tags were added
  if (payload === undefined) {
    return [];
  }
  // if only 1 tag was added
  if (typeof payload === 'string') {
    return [ parseInt(payload, 10) ];
  }
  // if more than one tag was added
  return payload.map(function (tag) { return parseInt(tag, 10) });
}
