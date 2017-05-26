'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var iid = request.params.id;
  var options;
  var initialCategories = [];

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.insights.getById(iid,
    function (dbErr, insight) {
      Hoek.assert(!dbErr, 'database error');
      if (insight.length === 0) {
        // no insight by that ID found
        return reply(Boom.notFound('That insight does not exist!'));
      }
      request.server.methods.pg.tags.getTagsForEdit('insights', iid,
        function (pgErr, tags) {
          Hoek.assert(!pgErr, 'database error');
          var tagList = helpers.locationCategoryToEnd(tags);
          var tagCat = {};
          options = Object.assign(
            insight[0],
            {initialTags: JSON.stringify(insight[0].tags)},
            permissions,
            {
              typeDropdown:
                helpers.insightTypeDropdown(insight[0].type)
            },
            {tagList: tagList},
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

          return reply.view('insights/edit', options).code(error ? 401 : 200);
        });
    });
};
