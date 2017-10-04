'use strict';

var Hoek = require('hoek');

module.exports = function (request, reply) {
  var searchTerm = request.query.searchTerm;

  request.server.methods.pg.organisations.orgsSearch(searchTerm,
    function (pgErr, listOfOrgs) {
      Hoek.assert(!pgErr, 'error getting matching orgs');
console.log(listOfOrgs);
      return reply.view('search_results', {orgs: listOfOrgs});
    });
};

// JSON.stringify(listOfOrgs)
