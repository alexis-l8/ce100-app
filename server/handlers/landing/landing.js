'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');
var landingContent = require('./content.js');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn);
  var userId = permissions.permissions.userId;
  var options = {};
  var content;
  var header;
  var sections;

  if (loggedIn.scope === 'admin') {
    return reply.redirect('/orgs');
  }

  request.server.methods.pg.people.getBy('id', userId,
    function (pgErr, profile) {
      Hoek.assert(!pgErr, 'Database Error');

      if (loggedIn.scope === 'primary') {
        content = landingContent(profile[0]);
        sections = content.sections
        header = content.header;
      } else {
        content = landingContent(profile[0]);
        header = content.header;
        sections = content.sections.filter(function (card, index) {
          return Boolean(card.primaryOnly) === false;
        });
      }

      options = Object.assign(
        { section: addLinkToValue(sections) },
        {header: header},
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
