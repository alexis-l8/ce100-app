'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var cid = request.params.id;
  var pgChallenges = request.server.methods.pg.challenges;
  var permissions;
  var options;
  var challenge;

  pgChallenges.getById(cid, function (pgErr1, challengeResponse) {
    Hoek.assert(!pgErr1, 'database error, could not retreive that challenge');
    if (challengeResponse.length === 0) {
      return reply(Boom.notFound('That challenge does not exist'));
    }
    challenge = challengeResponse[0];
    permissions = helpers.getPermissions(loggedIn, 'organisation_id', challenge.org_id);

    // if challenge is not active,
    // only the user belonging the org that created the challenge can view it
    if (!challenge.active && loggedIn.organisation_id !== challenge.org_id) {
      return reply(Boom.forbidden('You are not allowed to view that challenge'));
    }

    options = Object.assign(
      {},
      permissions,
      { challenge: challenge },
      { cancelUrl: helpers.getCancelUrl(request) }
    );
    // if the logged in user does not belong to this challenges org or is not an
    // admin then they will not be able to see suggested matches
    if (!options.permissions.editable) {
      return reply.view('challenges/details', options);
    }
    // get suggested matches
    return pgChallenges.getMatchingOrgs(cid, function (pgErr2, orgs) {
      var errorMessage = 'Database error. Could not retrieve suggested matches';
      var optionsMatches;

      Hoek.assert(!pgErr2, errorMessage);
      optionsMatches = Object.assign({}, options, { suggested_matches: orgs });
      return reply.view('challenges/details', optionsMatches);
    });
  });
};
