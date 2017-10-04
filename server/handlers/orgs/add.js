var Hoek = require('hoek');
var S3 = require('../../s3.js');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var newOrg;
  return S3.upload(request.payload, function (err, data) {
    Hoek.assert(!err, 'Image upload error');
    newOrg = helpers.preparePayload(request.payload, data);

    request.server.methods.pg.organisations.add(newOrg,
      function (pgErr) {
        Hoek.assert(!pgErr, 'Database error');

        return reply();
      });
  });
};
