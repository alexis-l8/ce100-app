var Hoek = require('hoek');
var helpers = require('./helpers.js');

// TODO: DELETE ONCE ADMIN NAV BAR IS BUILT #101
var alternate = [{
  path: '/orgs/add',
  name: '+'
}, {
  path: '/people',
  name: 'People'
}];

module.exports = (request, reply) => {
  var loggedIn = request.auth.credentials;
  var permissions = helpers.getPermissions(loggedIn, 'scope', 'admin');
  // get all orgs
  request.redis.LRANGE('organisations', 0, -1, (error, allOrgsString) => {
    Hoek.assert(!error, 'redis error');
    request.redis.LRANGE('challenges', 0, -1, (error, allChallengesString) => {
      Hoek.assert(!error, 'redis error');
      var orgs = helpers.parseArray(allOrgsString);
      var challenges = helpers.parseArray(allChallengesString);

      // Filter out unwanted orgs depending on permissions
      var browsableOrgs = getBrowsable(loggedIn.scope, orgs);
      // get tag we are filtering by
      var filterTag = getFilterTag(request.query.filter);
      // format the name of the current tag being filtered for the use of handlebars
      var filters = helpers.getTagFromId(require('../../tags/tags.json'))(filterTag);
      // provide handlebars view with information as to which view to render
      var view = { [request.params.view]: true };
      var sortedData;
      // if browsing challenges:
      if (view.challenges) {
        // build up array of all relevent challenge ids
        var challengeIds = allChallengeIds(browsableOrgs);
        // map through all challenge id's
        var allChallenges = challengesFromIds(challenges, challengeIds);
        // remove any archived challenges and add the `shared_by` key
        var active = addSharedBy(browsableOrgs, helpers.filterActive(allChallenges));
        // sort by most recent
        sortedData = helpers.sortByDate(active);
      }
      // if browsing orgs
      else {
        sortedData = helpers.sortAlphabetically('name')(browsableOrgs);
      }
      // filter challenges by tags
      var filtered = filterByTag(filterTag, sortedData);
      var options = Object.assign({}, {data: filtered}, {filters}, {view}, {alternate}, permissions);
      reply.view('browse/browse', options);
    });
  });
};

function getBrowsable (scope, orgs) {
  return scope === 'admin'
    ? orgs
    : helpers.filterActive(orgs);
}

// function takes the filter query param and returns [id,id] array or falsey if no param
function getFilterTag (filter) {
  return filter && filter.split(',').map(id => parseInt(id, 10));
}

// TODO: split up into smaller fns if reusable
function filterByTag (filtered, arr) {
  return !filtered || arr.length === 0
    ? arr // return if no tag is given or array is empty.
    : arr.filter(el =>
      // reduce each tag array to true or false
      el.tags && el.tags.reduce((bool, tag) =>
        tag[0] === filtered[0] && tag[1] === filtered[1] ? true : bool
      , false)
    );
}

// add key `shared_by` to each challenge
function addSharedBy (allOrgs, challenges) {
  return challenges.map(chal => {
    var shared_by = allOrgs[chal.org_id].name;
    return Object.assign({}, chal, {shared_by});
  });
}

// TODO: refactor to reuse functions from org-details-view.js
function challengesFromIds (challenges, ids) {
  return ids.map(id => {
    var challengeCard = challenges[id];
    var tagsData = helpers.getTagNames(challengeCard.tags);
    return Object.assign({}, challengeCard, {tagsData});
  });
}

// build up an array of all challenge ids from all given orgs
function allChallengeIds (orgs) {
  return orgs.reduce((challengeIds, org) => challengeIds.concat(org.challenges), []);
}
