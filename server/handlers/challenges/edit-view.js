'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var cid = request.params.id;
  var message, options;

  request.server.methods.pg.challenges.checkEditable(loggedIn.userId, cid,
    function (editableErr, isEditable) {
      Hoek.assert(!editableErr, 'database error');
      if (!isEditable) {
        message = 'You do not have permission to edit this challenge.';

        return reply(Boom.unauthorized(message));
      }

      return request.server.methods.pg.challenges.getById(cid,
        function (dbErr, chal) {
          var challenge = chal[0];

          Hoek.assert(!dbErr, 'database error');
          options = Object.assign(
            challenge,
            helpers.getPermissions(loggedIn, 'organisation_id', challenge.org_id),
            { error: error });

          return reply.view('challenges/edit', options).code(error ? 401 : 200);
        });
    });
};
