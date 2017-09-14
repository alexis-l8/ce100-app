'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');
var damAPIHelpers = require('../dam-api-helpers');
var Wreck = require('wreck');
var config = require('../../config.js');

module.exports = function (request, reply) {
  var options;
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  // set filter tag, integer if one is given, and `false` if not.
  var filterTag = (request.query && request.query.tags) || false;
  // Get filter tag data
  // Wreck.get(config.damApiUrl + '/api/tags/' + filterTag + '/', (err, res, payloadTag) => {
  //     var tag = payloadTag.toString();
  //     var tagData = JSON.parse(tag);
  // });

  Wreck.get(config.damApiUrl + '/api/assets/', (err, res, payload) => {
      var payload = payload.toString();
      var data = JSON.parse(payload);
      data = data.map(function(asset) {
        return damAPIHelpers.assetToInsight(asset);
      });
      options = Object.assign(
        { insights: data },
        { filter: helpers.browseViewTabBar('insights', null) },
        { view: helpers.getView(request.path) },
        {topNavBarType: 'explorer'},
        permissions
      );
      return reply.view('insights/browse', options);
  });

  // request.server.methods.pg.insights.browse(
  //   !permissions.permissions.admin, filterTag, function (pgErr, pgRes) {
  //     Hoek.assert(!pgErr, 'error getting insights by tag' + pgErr);
  //     options = Object.assign(
  //       { insights: pgRes.insights },
  //       { filter: helpers.browseViewTabBar('insights', pgRes.filter) },
  //       { view: helpers.getView(request.path) },
  //       {topNavBarType: 'explorer'},
  //       permissions
  //     );
  //
  //     return reply.view('insights/browse', options);
  //   });
};
