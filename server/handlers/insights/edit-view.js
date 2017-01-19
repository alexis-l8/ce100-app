'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var iid = request.params.id;
  var options;

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.insights.getById(iid,
    function (dbErr, insight) {
      Hoek.assert(!dbErr, 'database error');
      if (insight.length === 0) {
        // no insight by that ID found
        return reply(Boom.notFound('That insight does not exist!'));
      }

      options = Object.assign(
        insight[0],
        permissions,
        {
          typeDropdown:
            helpers.insightTypeDropdown(insight[0].type)
        },
        { error: error }
      );

      return reply.view('insights/edit', options).code(error ? 401 : 200);
    });
};
