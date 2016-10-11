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
    var orgs = helpers.parseArray(allOrgsString);

    // Filter out unwanted orgs depending on permissions
    var browsableOrgs = getBrowsable(loggedIn.scope, orgs);
    // get tag we are filtering by
    var filterTag = request.query.tags ? getFilterTag(request.query.tags) : false;

    // provide handlebars view with information as to which view to render
    var view = { [request.route.path.split('/')[1]]: true };

    // format the name of the current tag being filtered for the use of handlebars
    getFilterTagDetails(request.redis, filterTag, filters => {
      // if browsing challenges:
      if (view.challenges) {
        getChallengesData(request.redis, browsableOrgs, sortedData => {
          // filter challenges by tags
          var filtered = filterByTag(filterTag, sortedData);
          var options = Object.assign({}, {data: filtered}, {filters}, {view}, {alternate}, permissions);
          reply.view('browse/browse', options);
        });
      } else {
        var sortedData = helpers.sortAlphabetically('name')(browsableOrgs);
        // filter challenges by tags
        var filtered = filterByTag(filterTag, sortedData);
        var options = Object.assign({}, {data: filtered}, {filters}, {view}, {alternate}, permissions);
        reply.view('browse/browse', options);
      }
    });
  });
};

function getChallengesData (redis, browsableOrgs, callback) {
  // build up array of all relevent challenge ids
  redis.LRANGE('challenges', 0, -1, (error, allChallengesString) => {
    Hoek.assert(!error, 'redis error');
    var challenges = helpers.parseArray(allChallengesString);
    var challengeIds = allChallengeIds(browsableOrgs);
    // only gets challenges associated with _active_ organisations
    helpers.getChallenges(redis, challenges, challengeIds, allChallenges => {
      // remove any archived challenges (with filterActive) and add the `shared_by` key
      var active = addSharedBy(challenges, helpers.filterActive(allChallenges));
      // sort by most recent
      var sortedData = helpers.sortByDate(active);
      callback(sortedData);
    });
  });
}

function getFilterTagDetails (redis, filterTag, callback) {
  if (filterTag) {
    redis.HGET('tags', 'tags', (error, response) => {
      Hoek.assert(!error, error);
      var allTags = JSON.parse(response);
      var filters = helpers.getTagFromId(allTags)(filterTag);
      callback(filters);
    });
  } else {
    callback(false);
  }
}

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
    // this should never return false because we only get the challengeIds of _active_ organisations.
    var shared_by = allOrgs.filter(org => org.id === chal.org_id);
    return Object.assign({}, chal, {shared_by: shared_by.name});
  });
}

// build up an array of all challenge ids from all given orgs
function allChallengeIds (orgs) {
  return orgs.reduce((challengeIds, org) => challengeIds.concat(org.challenges), []);
}
