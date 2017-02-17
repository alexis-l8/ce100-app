'use strict';

var helpers = require('../helpers.js');

module.exports = function (pageType) {
  return function (request, reply) {
    var permissions = helpers.getPermissions(request.auth.credentials);
    var options = {};

    request.server.methods.pg.tags.getAllActive(function (error, allActive) {
      options.pageType = pageType;
      options.allActive = helpers.locationCategoryToEnd(allActive);
      options.permissions = permissions.permissions;
      if (Object.keys(options.allActive).length === 0) {
        return reply.view('browse/no-tags', options);
      }

      return reply.view('browse/categories-tags', options);
    });
  };
};
