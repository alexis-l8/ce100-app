var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  // get all orgs
  request.redis.LRANGE('organisations', 0, -1, (error, allOrgsString) => {
    Hoek.assert(!error, 'redis error');
    request.redis.LRANGE('challenges', 0, -1, (error, allChallengesString) => {
      Hoek.assert(!error, 'redis error');
      // if logged in has an org, remove it from the list of orgs
      var usefulOrgs = filterActive(removeUsersOrg(loggedIn, allOrgsString));
      // build up array of all relevent challenge ids
      var challengeIds = allChallengeIds(usefulOrgs);
      // map through all challenge id's
      var allChallenges = challengesFromIds(allChallengesString, challengeIds);
      // remove any archived challenges
      var challenges = addSharedBy(allOrgsString, filterArchived(allChallenges));
      // TODO: filter by tags
      // sort by most recent
      var sorted = sortByDate(cloneArray(challenges));

      var options = Object.assign({}, {challenges: sorted}, permissions);
      reply.view('browse', options);
    });
  });
};

// TODO: put clone array into helpers
function cloneArray (arr) {
  return arr.map(el => Object.assign({}, el));
}

function sortByDate (arr) {
  return arr.sort((ch1, ch2) => ch2.date - ch1.date);
}

function addSharedBy (allOrgs, challenges) {
  return challenges.map(chal => {
    var shared_by = JSON.parse(allOrgs[chal.org_id]).name;
    return Object.assign({}, chal, {shared_by});
  });
}

// TODO: refactor to reuse functions from org-details-view.js
function challengesFromIds (challenges, ids) {
  return ids.map(id => {
    var challengeCard = JSON.parse(challenges[id]);
    var tagsArray = getTagNames(challengeCard.tags);
    return Object.assign({}, challengeCard, {tags: tagsArray});
  });
}

function getTagNames (tagIds) {
  var allTags = require('../../tags/tags.json');
  return tagIds.map(tagId => ({
    id: tagId,
    name: allTags[tagId[0]].tags[tagId[1]].name
  }));
}

function filterActive (arr) {
  return arr.filter((el) => JSON.parse(el).active);
}

function filterArchived (arr) {
  return arr.filter((el) => !el.archived);
}

function allChallengeIds (orgsString) {
  return orgsString.reduce((challengeIds, org) => challengeIds.concat(JSON.parse(org).challenges), []);
}

function removeUsersOrg (loggedIn, allOrgsString) {
  if (loggedIn.organisation_id === -1) { return allOrgsString; }
  return allOrgsString.slice(0, loggedIn.organisation_id).concat(allOrgsString.slice(loggedIn.organisation_id + 1));
}
