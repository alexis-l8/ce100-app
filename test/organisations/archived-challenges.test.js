var tape = require('tape');
var initServer = require('../../server/server.js');
var config = require('../../server/config.js');

var sessions = require('../helpers/add-sessions.js');
var challengeData = require('ce100-mock-data').challenges;


// this helper will take the challenges from mock data and return all the active
// or inactive challenges associated with an org
// It returns an array of challenge titles
function expectedChallenges(isActive, orgId) {
  return challengeData.filter(function (chal) {
    return chal.active === isActive && chal.org_id == orgId;
  }).map(function (chal) {
    return chal.title;
  });
}

function viewArchivedChallenges (user, id) {
  return {
    url: '/orgs/' + id + '/archived-challenges',
    headers: { cookie: 'token=' + sessions.tokens(config.jwt_secret)[user] }
  };
}


// Primary users can only view archived challenges of their own org
tape('/orgs/1/archived-challenges (GET) - Primary users can view archived challenges created by their own org: --> ' + __filename, function (t) {
  sessions.addAll(function () {
    initServer(config, function (error, server, pool) {
      server.inject(viewArchivedChallenges('primary_3', 1), function (res) {
        t.equal(res.statusCode, 200, 'primary can view own archived challenges');

        var archived = expectedChallenges(false, 1);
        var active = expectedChallenges(true, 1);

        // check that all archived challenges in this primary users organisation are displayed
        archived.forEach(function (chal, index) {
          t.ok(res.payload.indexOf(chal) > -1, 'inactive challenge belonging to this primarys organisation is displayed');
          if (index === archived.length - 1) {
            // check that no active challenges in this primary users organisation are displayed
            active.forEach(function (chal, index) {
              t.ok(res.payload.indexOf(chal) === -1, 'active challenge belonging to this primarys organisation is not displayed');
              if (index === active.length - 1) {

                t.end();
                pool.end();
                server.stop();
              }
            });
          }
        });
      });
    });
  });
});


var testUsers = ['admin_1', 'primary_3', 'secondary_12'];

testUsers.forEach(function (user) {
  var userType = user.split('_')[0];

  // admins primary and secondary users cannot view archived challenges view for a different org
  tape('/orgs/1/archived-challenges (GET) - check permissions on archived challenges: --> ' + __filename, function (t) {
    sessions.addAll(function () {
      initServer(config, function (error, server, pool) {
        server.inject(viewArchivedChallenges(user, 2), function (res) {
          t.equal(res.statusCode, 403, userType + ' cannot view archived challenges of different org');

          t.end();
          pool.end();
          server.stop();
        });
      });
    });
  });
});
