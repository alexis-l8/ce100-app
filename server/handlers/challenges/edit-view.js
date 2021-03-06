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
      if (!isEditable && loggedIn.scope !== 'admin') {
        message = 'You do not have permission to edit this challenge.';

        return reply(Boom.unauthorized(message));
      }

      return request.server.methods.pg.challenges.getById(cid,
        function (dbErr, chal) {
          var challenge = chal[0];
          var initialCategories = [];

          Hoek.assert(!dbErr, 'database error');

          request.server.methods.pg.tags.getTagsForEdit('challenges', cid,
            function (pgErr, tags) {
              Hoek.assert(!pgErr, 'database error');
              var tagList = helpers.locationCategoryToEnd(tags);
              var tagCat = {};

              options = Object.assign(
                permissions,
                challenge,
                {initialTags: JSON.stringify(challenge.tags)},
                {tagList: tagList},

                helpers.getPermissions(
                  loggedIn, 'organisation_id', challenge.org_id),
                { error: error }
              );

              // create initial state for categories, ie categories that are selected
              initialCategories = options.tagList.filter(function(t) {
                return t.selected;
              }).map(function(t) {
                return {
                  category_id: t.category_id,
                  category_name: t.category_name
                }
              });

              options.initialCategories = JSON.stringify(initialCategories);

              // crate a map tag -> catgory
              tagList.forEach(function(cat) {
                cat.tags.forEach(function(t) {
                  tagCat[t.tag_id] = {category_id: cat.category_id, category_name: cat.category_name};
                })
              })

              options.tagCat = JSON.stringify(tagCat);

              return reply.view('challenges/edit', options).code(error ? 401 : 200);

            });
        });
    });
};
