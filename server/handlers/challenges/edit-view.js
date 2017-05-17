'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
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

          request.server.methods.pg.tags.getTagsForEdit('challenges', cid,
            function (pgErr, tags) {
              Hoek.assert(!pgErr, 'database error');

              options = Object.assign(
                permissions,
                challenge,
                {tagList: helpers.locationCategoryToEnd(tags)},
                helpers.getPermissions(
                  loggedIn, 'organisation_id', challenge.org_id),
                { error: error }
              );
              console.log(challenge);
              var idTags = challenge.tags.map(function(t) {
                var obj = {}
                obj.id = t.id;
                obj.name = t.name;
                return obj;
              })

              options.initialTags = JSON.stringify(idTags);

              return reply.view('challenges/edit', options).code(error ? 401 : 200);

            });
        });
    });
};
