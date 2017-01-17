'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var S3 = require('../../s3.js');

// remove an array of keys that may or may not be present from an object
function dissocAll (arr, obj) {
  return Object.keys(obj).reduce(function (newOb, key) {
    arr.indexOf(key) > -1 ? newOb : newOb[key] = obj[key]; //eslint-disable-line

    return newOb;
  }, {});
}

// remove logoand file_name, add logo_url to payload obj
function preparePayload (payload, data) {
  var logo_url = data && data.Location;
  var strippedPayload = dissocAll(['logo', 'file_name'], payload);

  return logo_url
    ? Object.assign({}, strippedPayload, { logo_url: logo_url })
    : strippedPayload;
}

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var newOrg;

  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin' || loggedIn.scope === 'secondary') {
    return reply(Boom.forbidden('You do not have permission to edit that organisation.'));
  }

  return S3.upload(request.payload, function (err, data) {
    Hoek.assert(!err, 'Image upload error');
    // we want to build up a new object that will be saved to the db
    newOrg = preparePayload(request.payload, data);

    request.server.methods.pg.organisations.edit(orgId, newOrg, function (error, response) { //eslint-disable-line
      Hoek.assert(!error, 'database error');

      return reply.redirect('/orgs/' + orgId + '/tags');
    });
  });
};
