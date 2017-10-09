var Hoek = require('hoek');
var helpers = require('../helpers.js');
var Boom = require('boom');

module.exports = function (request, reply) {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  var topNavBarType = loggedIn.organisation_id === orgId ? 'profile' : 'explorer';
  var result = {};

  // get organisation main details
  request.server.methods.pg.organisations.orgsGetById(orgId, function (error, orgData) {
    result.org = orgData;
    // get tags linked to the organisation
    request.server.methods.pg.organisations.orgsGetTags(orgId, function (error, tags) {
      result.tags = tags;

      // get challenges of the organisation
      request.server.methods.pg.challenges.getByOrgId(orgId, function (error, challenges) {
        result.challenges = challenges;

        // get all the active user of the organisation
        request.server.methods.pg.people.peopleGetByOrgId(orgId, function (error, people) {
          result.people = people;

          return reply(JSON.stringify(result, null, 2));
        })

      })
    });
  });


  // request.server.methods.pg.organisations.getDetails(orgId, function (error, orgData) {
  //   console.log(orgData);
  //
  //   // organisation (id, name, mission_statement, logo_url, active)
  //     // tags (id, name)
  //   // challenges (id, title)
  //   //people (first_nane, last_name, user_type, logo_url, email, phone, job_title, active)
  //   Hoek.assert(!error, 'Error retrieving organisation with id ' + orgId)
  //   var blockAccess =
  //     !(loggedIn.scope === 'admin' || loggedIn.scope === 'content-owner')
  //     && !orgData.org.active;
  //   // If the organisation is not active, then only an admin and content-owner can view
  //   if (blockAccess) {
  //     return reply(Boom.forbidden('You cannot access that organisation'));
  //   }
  //
  //   var options = Object.assign(
  //     {},
  //     orgData,
  //     { view: helpers.getView(request.path) },
  //     {topNavBarType: topNavBarType},
  //     permissions
  //   );
  //
  //   return reply.view('organisations/details', options);
  // });
};
