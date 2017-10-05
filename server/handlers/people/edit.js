'use strict';

var Hoek = require('hoek');
var Boom = require('boom');
var S3 = require('../../s3.js');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var editId = request.params.id && JSON.parse(request.params.id);
  var payload = request.payload;
  var logo;
  var file_name = '';
  var editUser;

  if (payload.email) {
    payload.email = payload.email.toLowerCase();
  }

  if (payload.logo) {
    logo = payload.logo._data;
    file_name = payload.logo.hapi.filename;
  }

  payload.logo = logo;
  payload.file_name = file_name;

  if (parseInt(loggedIn.userId, 10) !== editId && (loggedIn.scope !== 'admin' && loggedIn.scope !== 'content-owner')) {
    return reply(Boom.forbidden());
  }

  return S3.upload(request.payload, function (err, data) {
    Hoek.assert(!err, 'Image upload error');
    editUser = helpers.preparePayload(request.payload, data);
    return request.server.methods.pg.people.edit(editId, editUser,
      function (pgErr) {
        Hoek.assert(!pgErr, 'database error');

        // if admin, redirect to /people, otherwise redirect to users profile
        return (loggedIn.scope === 'admin' || loggedIn.scope === 'content-owner' )
          ? reply.redirect('/people')
          : reply.redirect('/orgs/' + loggedIn.organisation_id)
      });
  });


};
