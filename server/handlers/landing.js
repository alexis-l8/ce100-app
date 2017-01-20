'use strict';

var Hoek = require('hoek');
var helpers = require('./helpers.js');

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

      sections = [
        { title: 'Welcome ' + profile[0].first_name },
        {
          title: 'Tell us about you',
          description:
            'What are the circular economy visions and '
            + 'areas of knowledge of your organisation?',
          link: {
            text: 'Fill in your profile',
            url: '/people/' + profile[0].id + '/edit'
          }
        },
        {
          title: 'Get to know the network',
          description:
            'Who are the members, their areas of experience '
            + 'and their challenges?',
          link: {
            text: 'Explore now',
            url: '/orgs'
          }
        },
        {
          title: 'Share a challenge',
          description:
            'And find out who has the relevant experience to learn from, '
            + 'to help you solve it.',
          link: {
            text: 'Share a challenge now',
            url: '/challenges/add'
          }
        },
        {
          title: 'Find the latest insights',
          description:
            'Explore circular economy insights related to your topic '
            + 'of interest.',
          link: {
            text: 'Find insights',
            url: '/insights'
          }
        }
      ];

      options = Object.assign(
        { section: sections },
        { permissions: permissions.permissions }
      );
      console.log(options);

      return reply.view('landing', options);
    });
};
