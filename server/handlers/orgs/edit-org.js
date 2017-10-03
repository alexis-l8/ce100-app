'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var S3 = require('../../s3.js');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var tags = helpers.getTagArray(request.payload.tags);
  var newOrg;
  var blocked = !(loggedIn.organisation_id == orgId && loggedIn.scope === 'primary')
                && (loggedIn.scope !== 'admin' && loggedIn.scope !== 'content-owner');
  if (blocked) {
    return reply(Boom.forbidden('You do not have permission to edit that organisation.'));
  }

  return S3.upload(request.payload, function (err, data) {
    Hoek.assert(!err, 'Image upload error');
    // we want to build up a new object that will be saved to the db
    newOrg = helpers.preparePayload(request.payload, data);

    request.server.methods.pg.organisations.edit(orgId, newOrg, function (error, response) { //eslint-disable-line
      Hoek.assert(!error, 'database error');
      // update tags
      return request.server.methods.pg.tags.addTags('organisations', orgId,
        tags, function (tagsError) {
          Hoek.assert(!tagsError, 'database error');

          return reply.redirect('/orgs/' + orgId);
        });

    });
  });
};
