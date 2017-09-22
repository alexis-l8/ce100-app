'use strict';

var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var sendEmail = require('../../email.js');
var config = require('../../config.js');


module.exports = function (request, reply) {
  var userObj = request.payload;
  userObj.email = userObj.email.toLowerCase();
  request.server.methods.pg.people.add(userObj, function (pgErr, pgRes) {
    var response = pgRes[0];
    Hoek.assert(!pgErr, 'database error');
    var user = Object.assign({}, {id: response.id}, userObj);

    sendEmail('welcome', user, function (emailErr) {
      Hoek.assert(!emailErr, 'send email error');

      return reply(response).redirect('/people');
    });
  });
};
