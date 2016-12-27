'use strict';

var Hoek = require('hoek');
var Boom = require('boom');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var rawData = request.payload;
  var insight = {};
  var insightId;

  insight.creator_id = loggedIn.userId;
  insight.org_id = loggedIn.organisation_id;
  insight.title = rawData.title;
  insight.url = rawData.url;
  insight.author = rawData.author;
  insight.doctype = rawData.doctype;
  insight.resource = Object.prototype.hasOwnProperty
    .call(rawData, 'resources');

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.insights.add(insight, function (err, res) {
    Hoek.assert(!err, 'database error');
    insightId = res[0].id;

    return reply.redirect('/insights');
    // return reply.redirect('/insights/' + insightId + '/tags');
  });
};
