'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var helpers = require('../helpers');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var rawData = request.payload;
  var insight = {};
  var insightId;
  var tags = helpers.getTagArray(rawData.tags)

  insight.creator_id = loggedIn.userId;
  insight.org_id = loggedIn.organisation_id;
  insight.title = rawData.title;
  insight.url = rawData.url;
  insight.author = rawData.author;
  insight.type = rawData.type;
  insight.resource = Object.prototype.hasOwnProperty
    .call(rawData, 'resource');
  insight.active = rawData.active ? true : false;

  if (loggedIn.scope !== 'admin') {
    return reply(Boom.forbidden());
  }

  return request.server.methods.pg.insights.add(insight, function (err, res) {
    Hoek.assert(!err, 'database error');
    insightId = res[0].id;

    return request.server.methods.pg.tags.addTags('insights', insightId,
      tags, function (tagsError) {
        Hoek.assert(!tagsError, 'database error');

        return reply.redirect('/insights');
      });
  });
};
