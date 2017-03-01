'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (pageType) {
  return function (request, reply) {
    var permissions = helpers.getPermissions(request.auth.credentials);
    var views, options;

    request.server.methods.pg.tags.getAllActive(function (error, allActive) {
      Hoek.assert(!error, 'Database Error');

      if (Object.keys(allActive).length === 0) {
        return reply.view('browse/no-tags', options);
      }

      views = {
        referer: '/orgs',
        cancel: '/orgs'
      };
      options = Object.assign(
        { permissions: permissions.permissions },
        { pageType: pageType },
        { allActive: helpers.locationCategoryToEnd(allActive) },
        { views: views }
      );

      return reply.view('browse/categories-tags', options);
    });
  };
};
