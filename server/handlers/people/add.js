'use strict';

var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var sendEmail = require('../../email.js');
var config = require('../../config.js');
var S3 = require('../../s3.js');
var helpers = require('../helpers.js');


module.exports = function (request, reply) {
  var userObj = request.payload;
  var logo;
  var file_name = '';
  var newUser;

  if (userObj.email) {
    userObj.email = userObj.email.toLowerCase();
  }

  if (userObj.logo) {
    logo = userObj.logo._data;
    file_name = userObj.logo.hapi.filename;
  }
  userObj.logo = logo;
  userObj.file_name = file_name;
  return S3.upload(request.payload, function (err, data) {
    Hoek.assert(!err, 'Image upload error');
    newUser = helpers.preparePayload(request.payload, data);
    request.server.methods.pg.people.add(newUser, function (pgErr, pgRes) {
      var response = pgRes[0];
      Hoek.assert(!pgErr, 'database error');
      var user = Object.assign({}, {id: response.id}, userObj);
      sendEmail('welcome', user, function (emailErr) {
        Hoek.assert(!emailErr, 'send email error');

        return reply(response).redirect('/people');
      });
    });
  });
};
