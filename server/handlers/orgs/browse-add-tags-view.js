'use strict';

var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var permissions = helpers.getPermissions(request.auth.credentials);
  var pageType = 'orgs';
  var options = {};

  request.pg.tags.getAllActive(function (error, allActive) {
    options.pageType = pageType;
    options.allActive = allActive;
    options.permissions = permissions;
    if (Object.keys(options.allActive).length === 0) {
      return reply.view('browse/no-tags', options);
    }

    return reply.view('browse/categories-tags', options);
  });
};
