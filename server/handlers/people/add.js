'use strict';

var Hoek = require('hoek');
var jwt = require('jsonwebtoken');
var sendEmail = require('../../email.js');
var config = require('../../config.js');


module.exports = function (request, reply) {
  var userObj = request.payload;

  request.server.methods.pg.people.add(userObj, function (pgErr, pgRes) {
    var response = pgRes[0];

    Hoek.assert(!pgErr, 'database error');
    sendActivationEmail(response.id, userObj, config.jwt_secret, function (emailErr) {
      Hoek.assert(!emailErr, 'send email error');

      return reply(response).redirect('/people');
    });
  });
};

function sendActivationEmail (id, user, secret, callback) {
  var hashedId = jwt.sign(id, secret);
  var newUser = Object.assign(
    {},
    user,
    {
      hashedId: hashedId,
      subject: 'Welcome to CE100!',
      url: config.root_url
    }
  );

  return sendEmail.newUser(newUser, callback);
}
