var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var tagsPayload = request.payload.tags;
  var loggedIn = request.auth.credentials;
  var tagsArray = getTagArray(tagsPayload);

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin' || loggedIn.scope === 'secondary') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }

  request.server.methods.pg.tags.addTags('organisations', orgId, tagsArray, function (pgErr, res) {
    Hoek.assert(!pgErr, 'database error');
    return reply.redirect('/orgs/' + orgId);
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
