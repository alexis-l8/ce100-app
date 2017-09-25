'use strict';

var Hoek = require('hoek');

module.exports = function (request, reply) {
  var term = request.query.term;

  request.server.methods.pg.organisations.orgsSearch(term.toLowerCase(),
    function (pgErr, listOfOrgs) {
      Hoek.assert(!pgErr, 'error getting matching orgs');
      return reply.view('search/search_results', {orgs: listOfOrgs});
    });
};
