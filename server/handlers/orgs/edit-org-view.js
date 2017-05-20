var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  var error = helpers.errorOptions(joiErr);
  var template;

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin' || loggedIn.scope === 'secondary') {
    return reply(Boom.forbidden('You do not have permission to edit that organisation.'));
  }

  request.server.methods.pg.organisations.getDetails(orgId, function (pgError, orgData) {
    Hoek.assert(!pgError, 'db error');
    request.server.methods.pg.tags.getTagsForEdit('organisations', orgId,
      function (pgErr, tags) {
        Hoek.assert(!pgErr, 'database error');
        var tagList = helpers.locationCategoryToEnd(tags);
        var tagCat = {};
        var missionStatementMessage = !Boolean(orgData.org.mission_statement);
        console.log(missionStatementMessage);
        selectedTags = orgData.org.tags.map(function(t) {
          return {name: t.tag_name, id: t.tag_id};
        });

        var options = Object.assign(
          {},
          orgData,
          {tags: selectedTags},
          {initialTags: JSON.stringify(selectedTags)},
          {tagList: tagList},
          permissions,
          {error},
          {missionStatementMessage: missionStatementMessage}
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


        template = 'organisations/edit-' + loggedIn.scope;
        return reply.view(template, options).code(error ? 401 : 200);
      });
  });
};
