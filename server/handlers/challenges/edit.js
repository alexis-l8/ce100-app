'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = (request, reply) => {
  var loggedIn = request.auth.credentials;
  var cid = request.params.id;
  var updates = request.payload;
  var message;

  request.server.methods.pg.challenges.checkEditable(loggedIn.userId, cid,
    function (editableErr, primary) {
      Hoek.assert(!editableErr, 'database error');
      if (!primary && loggedIn.scope !== 'admin') {
        message = 'You do not have permission to edit this challenge.';

        return reply(Boom.unauthorized(message));
      }

      return request.server.methods.pg.challenges.edit(cid, updates,
        function (err, res) {
          Hoek.assert(!err, 'database error');

          return reply.redirect('/challenges/' + cid + '/tags');
        });
    });
};
