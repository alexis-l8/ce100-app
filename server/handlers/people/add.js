var Hoek = require('hoek');
var jwt = require('jsonwebtoken');

var sendEmail = require('../../email.js');
var helpers = require('../helpers.js');
var config = require('../../config.js');


module.exports = function (request, reply) {
  var userObj = request.payload;

  request.server.methods.pg.people.add(userObj, function (pgErr, pgRes) {
    var response = pgRes[0];
    Hoek.assert(!pgErr, 'database error');
    sendActivationEmail(response.id, userObj, config.jwt_secret, function (emailErr, res) {
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
    { hashedId: hashedId,
    subject: 'Welcome to CE100!'
    }
  );

  return sendEmail.newUser(newUser, callback);
}
