'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers.js');

module.exports = function (request, reply, source, joiErr) {
  var error = helpers.errorOptions(joiErr);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var iid = request.params.id;
  var doctype = ['.pdf', '.jpeg', '.png'];
  var options;

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.insights.getById(iid,
    function (dbErr, insight) {
      Hoek.assert(!dbErr, 'database error');

      if (insight.length === 0) {
        // no insight by that ID found
        return reply(Boom.forbidden());
      }

      options = Object.assign(
        insight[0],
        permissions,
        {
          doctype:
            helpers.editInsightDoctypeDropdown(doctype, insight[0].doctype)
        },
        { error: error }
      );

      return reply.view('insights/edit', options).code(error ? 401 : 200);
    });
};
