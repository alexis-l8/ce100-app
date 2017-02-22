'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');
var landingContent = require('./content.js');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn);
  var userId = permissions.permissions.userId;
  var options = {};
  var sections;

  if (loggedIn.scope === 'admin') {
    return reply.redirect('/orgs');
  }

  request.server.methods.pg.people.getBy('id', userId,
    function (pgErr, profile) {
      Hoek.assert(!pgErr, 'Database Error');

      if (loggedIn.scope === 'primary') {
        sections = landingContent(profile[0]);
      } else {
        sections = landingContent(profile[0]).filter(function (card, index) {
          return Boolean(card.primaryOnly) === false;
        });
      }

      options = Object.assign(
        { section: addLinkToValue(sections) },
        { permissions: permissions.permissions }
      );

      return reply.view('landing', options);
    });
};

// add the index of the next element for the down arrow Navigation in handlebars
function addLinkToValue (arr) {
  return arr.map(function (card, index) {
    return Object.assign({ nextCardIndex: index + 1 }, card);
  })
}
