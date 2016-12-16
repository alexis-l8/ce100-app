var Hoek = require('hoek');
var Boom = require('boom');
var S3 = require('../../s3.js');

module.exports = function (request, reply) {
  console.log('payload', request.payload);
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  if (loggedIn.organisation_id !== orgId && loggedIn.scope !== 'admin') {
    return reply(Boom.unauthorized('You do not have permission to edit that organisation.'));
  }

  S3.upload(request.payload, function (err, data) {
    Hoek.assert(!err, 'Image upload error');
    // we want to build up a new object that will be saved to the db
    var newOrg = preparePayload(request.payload, data);

    request.server.methods.pg.organisations.edit(orgId, newOrg, function (error, response) {
      Hoek.assert(!error, 'database error');
      return reply.redirect('/orgs/' + orgId + '/tags');
    });
  });
};


// remove logoand file_name, add logo_url to payload obj
function preparePayload (payload, data) {
  var logo_url = data && data.Location;
  var strippedPayload = dissocAll(['logo', 'file_name'], payload);
  return logo_url
    ? Object.assign({}, strippedPayload, {logo_url})
    : strippedPayload;
}

// remove an array of keys that may or may not be present from an object
function dissocAll (arr, obj) {
  return Object.keys(obj).reduce((newOb, key) => {
    arr.indexOf(key) > -1 ? newOb : newOb[key] = obj[key];
    return newOb;
  }, {});
}
