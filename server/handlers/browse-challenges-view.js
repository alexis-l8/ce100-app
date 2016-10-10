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
      // sort by most recent
      var sorted = sortByDate(cloneArray(challenges));
      // filter challenges by tags
      var filterTag = getFilterTag(request.query.filter);
      var filtered = filterByTag(filterTag, sorted);
      // format the name of the current tag being filtered for the use of handlebars
      var filters = getTagFromId(require('../../tags/tags.json'))(filterTag);
      // provide handlebars view with information as to which view to render
      // currently fixed to challenges as this handler is not reused,
      // in the next PR i am going to work on browse/orgs flow which may end up using this handler
      var view = { challenges: true };
      var options = Object.assign({}, {challenges: filtered}, {filters}, {view}, permissions);
      reply.view('browse/browse', options);
    });
  });
};

// function takes the filter query param and returns [id,id] array or false if no param
function getFilterTag (filter) {
  return filter && filter.split(',').map(id => parseInt(id, 10));
}

// TODO: split up into smaller fns if reusable
function filterByTag (filtered, arr) {
  return !filtered
    ? arr // if no tag to be filtered by, return array
    : arr.filter(el =>
      // reduce each challenge cards tag array to true or false
      el.tags.reduce((bool, tag) =>
        tag.id[0] === filtered[0] && tag.id[1] === filtered[1] ? true : bool
      , false));
}

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

function getTagFromId (allTags) {
  return function (id) {
    return id && allTags[id[0]] && allTags[id[0]].tags[id[1]] && {
        id: id,
        name: allTags[id[0]].tags[id[1]].name
    };
  };
}

function getTagNames (tagIds) {
  var allTags = require('../../tags/tags.json');
  return tagIds.map(getTagFromId(allTags));
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
