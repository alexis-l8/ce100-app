'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var challengeId = request.payload.challengeId;
  var comment = {
    challenge_id: challengeId,
    comment: request.payload.comment,
    author_id: loggedIn.userId,
    flagged: false,
    author_flag: 'null',
    active: true,
  }
  return request.server.methods.pg.challenges.addComment(comment, function (err, res) {

    return reply.redirect('/challenges/' + challengeId)
  });
};
