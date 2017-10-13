'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers');

module.exports = (request, reply) => {
  var loggedIn = request.auth.credentials;
  var cid = request.params.id;
  var updates = request.payload;
  var message;
  var tags = helpers.getTagArray(updates.tags);

  request.server.methods.pg.challenges.checkEditable(loggedIn.userId, cid,
    function (editableErr, isPrimary) {
      Hoek.assert(!editableErr, 'database error');
      if (!(isPrimary || loggedIn.scope == 'admin')) {
        message = 'You do not have permission to edit this challenge.';

        return reply(Boom.unauthorized(message));
      }

      return request.server.methods.pg.challenges.edit(cid, updates,
        function (err, res) {
          Hoek.assert(!err, 'database error');

          // update tags
          return request.server.methods.pg.tags.addTags('challenges', cid,
            tags, function (tagsError) {
              Hoek.assert(!tagsError, 'database error');

              return reply.redirect('/challenges/' + cid);
            });
        });
    });
};
