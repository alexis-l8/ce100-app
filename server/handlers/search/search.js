'use strict';

var Hoek = require('hoek');
var helpers = require('../helpers.js');

module.exports = function (request, reply) {
  var term = trimSpaces(request.query.term);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  var options = Object.assign(
    permissions,
    {term: term},
    {topNavBarType: 'search'}
  );
  var data;
  var emptyResult = { people: [], orgs: [], challenges: [], insights: [] };

  if (term === '') {
    data = Object.assign(
      options,
      emptyResult,
      {total: totalResults(emptyResult)}
    );

    return reply.view('search/search_results', data);
  } else {
    search(request, term.toLowerCase().replace(/'/g, "''"), function (result) {
      result.people = filterPeople(permissions, result.people);

      data = Object.assign(
        options,
        result,
        {total: totalResults(result)}
      );

      return reply.view('search/search_results', data);
    });
  }
};

function trimSpaces(term) {
  return term.split(' ').filter(function (t) {
    return Boolean(t);
  }).join(' ')
}


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

function totalResults(result) {
  return  result.people.length
          + result.orgs.length
          + result.challenges.length
          + result.insights.length;
};

function filterPeople(permissions, people) {
  if (!permissions.permissions.admin) {
    return people.filter(function(p) {
      return p.account_activated
             && (p.user_type === 'primary' || p.user_type === 'secondary' );
    });
  } else {
    return people;
  }
}
