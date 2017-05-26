'use strict';

var Boom = require('boom');
var helpers = require('../helpers.js');
var Hoek = require('hoek');


module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.tags.getTagsForEdit('insights', null,
    function (pgErr, tags) {
      Hoek.assert(!pgErr, 'database error');
      var tagList = helpers.locationCategoryToEnd(tags);
      var tagCat = {};
      var selectedTags = [];

      var options = Object.assign(
        { typeDropdown: helpers.insightTypeDropdown() },
        {tags: selectedTags},
        {initialTags: JSON.stringify(selectedTags)},
        {tagList: tagList},
        {initialCategories: JSON.stringify([])},
        permissions,
        {topNavBarType: 'addInsight'},
        { error: error }
      );

      // crate a map tag -> catgory
      tagList.forEach(function(cat) {
        cat.tags.forEach(function(t) {
          tagCat[t.tag_id] = {category_id: cat.category_id, category_name: cat.category_name};
        })
      })

      options.tagCat = JSON.stringify(tagCat);

      return reply.view('insights/add', options).code(error ? 401 : 200);
    });
};
