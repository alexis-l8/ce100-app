'use strict';

var Hoek = require('hoek');

module.exports = function (request, reply) {
  var loggedIn = request.auth.credentials;
  var chal = request.payload;
  var chalId;

  chal.org_id = loggedIn.organisation_id;
  chal.creator_id = loggedIn.userId;
  chal.active = true; // MOVE THIS OUT INTO PLUGIN SO BY DEFAULT, VALUE IS TRUE;
  request.server.methods.pg.challenges.add(chal, function (err, res) {
    Hoek.assert(!err, 'database error');
    chalId = res[0].id;

    return reply.redirect('/challenges/' + chalId + '/tags');
  });
};
