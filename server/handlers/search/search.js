'use strict';

var Hoek = require('hoek');

module.exports = function (request, reply) {
  var term = request.query.term.toLowerCase();
  search(request, term, function (result) {
    return reply.view('search/search_results', result);
  });
};

function search(request, term, cb) {
  var pg = request.server.methods.pg;
  var result = {};

  pg.people.peopleSearch(term,
    function (peopleError, people) {
      Hoek.assert(!peopleError, 'error people search');
      result.people = people;

      pg.organisations.orgsSearch(term,
        function (orgsError, orgs) {
          Hoek.assert(!orgsError, 'error organisations search');
          result.orgs = orgs

          pg.challenges.challengesSearch(term,
            function (challengesErr, challenges) {
              Hoek.assert(!challengesErr, 'error challenges search');
              result.challenges = challenges;

              pg.insights.insightsSearch(term,
                function (insightsErr, insights) {
                  Hoek.assert(!insightsErr, 'error insights search');
                  result.insights = insights;

                  return cb(result);
                });
            });
        });
    });
};
