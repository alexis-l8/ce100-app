'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var iid = parseInt(request.params.id, 10);
  var options, views;

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.tags.getTagsForEdit('insights', iid,
    function (pgErr, tags) {
      Hoek.assert(!pgErr, 'Database Error');
      views = {
        referer: iid ? '/insights/' + iid + '/edit' : '/insights/add',
        cancel: '/orgs'
      };
      options = Object.assign(
        permissions,
        { views: views },
        { tags: tags },
        { error: error }
       );

      return reply.view('tags', options).code(error ? 400 : 200);
    });
};
