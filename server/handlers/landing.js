'use strict';

var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn);
  var userId = permissions.permissions.userId;
  var options = {};

  if (loggedIn.scope === 'admin') {
    return reply.view('orgs');
  }

  request.server.methods.pg.people.getBy('id', userId,
    function (pgErr, profile) {
      Hoek.assert(!pgErr, 'Database Error');

      options.section = [
        {
          title: 'Hi ' + profile[0].first_name,
          description: 'What do you want to do today?'
        },
        {
          title: 'Solve a challenge',
          description: 'Some text explaining what you can do',
          link: {
            text: 'Share your challenge now',
            url: '/challenges/add'
          }
        }
      ];

      return reply.view('landing', options);
    });
};
