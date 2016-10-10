var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var orgId = parseInt(request.params.id, 10);
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'organisation_id', orgId);
  if (orgId === -1) {
    return reply.redirect('/browse/orgs');
  }
  // get all orgs
  request.redis.LRANGE('organisations', 0, -1, (error, stringifiedOrgs) => {
    Hoek.assert(!error, 'redis error');

    // TODO: catch for case where org at specified userId doesn't exist.
    var orgs = helpers.parseArray(stringifiedOrgs);
    var organisation = orgs[orgId];
    helpers.getTagNames(request.redis, organisation.tags, organisationTags => {
      organisation.tagsData = organisationTags;

      // get all challenges
      request.redis.LRANGE('challenges', 0, -1, (error, challengesList) => {
        Hoek.assert(!error, 'redis error');
        var allChallenges = helpers.parseArray(challengesList);
        helpers.getChallenges(request.redis, allChallenges, organisation.challenges, challenges => {
          var activeChallenges = helpers.filterActive(challenges);
          // only add matches if primary user is logged in.
          if (loggedIn.organisation_id === orgId) {
            //  Filter inactive organisations, and users own org
            var organisations = helpers.filterActive(removeUsersOrg(loggedIn, orgs));
            activeChallenges = addMatchesToChallenges(organisations, activeChallenges);
          }
          var sorted = helpers.sortByDate(activeChallenges);

          // if no primary user then reply
          if (organisation.primary_id === -1) {
            var options = Object.assign({}, {activeChallenges: sorted}, {organisation}, permissions);
            return reply.view('organisations/details', options);
          }

          // else get linked primary user and reply
          request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedUser) => {
            Hoek.assert(!error, 'redis error');
            var primary_user = getUserInfo(stringifiedUser);
            var options = Object.assign({}, {primary_user}, {activeChallenges: sorted}, {organisation}, permissions);
            return reply.view('organisations/details', options);
          });
        });
      });
    });
  });
};

function addMatchesToChallenges (allOrgs, allChallenges) {
  return allChallenges.map(ch => {
    var matches = getMatches(allOrgs, ch);
    var filtered = filterZeroMatches(matches);
    var sorted = topTen(sortByMatches(filtered));
    return Object.assign({}, ch, {matches: sorted});
  });
}

// returns 1 or 0 if challengeTag exists in orgTags
function filterEachTag (challengeTag, orgTags) {
  return orgTags.reduce((count, current) =>
    challengeTag[0] === current[0] && challengeTag[1] === current[1] ? count + 1 : count
  , 0);
}

// maps through orgs and adds number of matches with given challenge
function getMatches (orgs, challenge) {
  return orgs.map(org => {
    // increase the count by one if there is a match with this org
    var matches = challenge.tags.reduce((count, chalTag) => {
      return count + filterEachTag(chalTag, org.tags);
    }, 0);
    return Object.assign({}, org, {matches});
  });
}

function topTen (arr) {
  return arr.slice(0, 10);
}
function filterZeroMatches (allOrgs) {
  return allOrgs.filter((org) => org.matches > 0);
}

function sortByMatches (orgs) {
  return helpers.cloneArray(orgs).sort((a, b) => b.matches - a.matches);
}

function getUserInfo (stringifiedUser) {
  var { first_name, last_name, email, phone, job_title } = JSON.parse(stringifiedUser);
  return {first_name, last_name, email, phone, job_title};
}

function removeUsersOrg (loggedIn, allOrgs) {
  return allOrgs.filter(org => loggedIn.organisation_id !== org.id);
}
