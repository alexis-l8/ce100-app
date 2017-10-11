'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var cid = request.params.id;
  var message;
  var orgId = request.query['org_id'];

  request.server.methods.pg.challenges.checkEditable(loggedIn.userId, cid,
    function (editableErr, isEditable) {
      Hoek.assert(!editableErr, 'database error');
      if (!isEditable && loggedIn.scope !== 'admin') {
        message = 'You do not have permission to edit this challenge.';

        return reply(Boom.unauthorized(message));
      }

      return request.server.methods.pg.challenges.toggleActive(cid,
        function (err, res) {
          Hoek.assert(!err, 'database error');

          return reply.redirect('/orgs/' + (loggedIn.organisation_id || orgId));
        });
    });
};
