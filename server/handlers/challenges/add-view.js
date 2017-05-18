'use strict';

var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');


  if (loggedIn.scope !== 'primary') {
    return reply(Boom.forbidden());
  }

  request.server.methods.pg.tags.getTagsForEdit('challenges', null,
    function (pgErr, tags) {
      var tagList = helpers.locationCategoryToEnd(tags);
      var tagCat = {};
      var options = Object.assign(
        { view: helpers.getView(request.path) },
        permissions,
        {initialCategories: JSON.stringify([])},
        {initialTags: JSON.stringify([])},
        {tagList: tagList},
        { error: error }
      );

      // crate a map tag -> catgory
      tagList.forEach(function(cat) {
        cat.tags.forEach(function(t) {
          tagCat[t.tag_id] = {category_id: cat.category_id, category_name: cat.category_name};
        })
      })

      options.tagCat = JSON.stringify(tagCat);

      return reply.view('challenges/add', options).code(error ? 401 : 200);
    })

};
