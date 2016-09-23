var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply) => {
  var orgId = +request.params.id;
  var permissions = helpers.getPermissions(request.auth.credentials, 'organisation_id', orgId);
  console.log(orgId, permissions);
  if (orgId === -1) {
    return reply.redirect('/orgs');
  }
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    // TODO: catch for case where org at specified userId doesn't exist.
    var organisation = JSON.parse(stringifiedOrg);
    // get all challenges
    request.redis.LRANGE('challenges', 0, -1, (error, challengesList) => {
      Hoek.assert(!error, 'redis error');
      var challenges = getChallenges(challengesList, organisation);

      // if no primary user then reply
      if (organisation.primary_id === -1) {
        var options = Object.assign({}, {challenges}, {organisation}, permissions);
        return reply.view('organisations/details', options);
      }

      // else get linked primary user and reply
      request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedUser) => {
        Hoek.assert(!error, 'redis error');
        var primary_user = getUserInfo(stringifiedUser);
        var options = Object.assign({}, {primary_user}, {challenges}, {organisation}, permissions);
        return reply.view('organisations/details', options);
      });
    });
  });
};

function getUserInfo (stringifiedUser) {
  var { first_name, last_name, email, phone, job_title } = JSON.parse(stringifiedUser);
  return {first_name, last_name, email, phone, job_title};
}

function getChallenges (challengesList, organisation) {
  var challengeArr = organisation.challenges.map((challengeId, index) => {
    var challengeCard = JSON.parse(challengesList[challengeId]);
    var tagsArray = getTagNames(challengeCard.tags);
    return Object.assign({}, challengeCard, {tags: tagsArray});
  });
  return challengeArr.length === 0 ? false : challengeArr;
}

function getTagNames (tagIds) {
  var allTags = require('../../tags/tags.json');
  return tagIds;
    // This will make sense in a future commit. Has been cherry picked from 76a18c05f24d6eb6649c45ee28222af82628e3e2
  // return tagIds.map(tagId => {
  //   return {
  //     id: tagId,
  //     name: allTags[tagId[0]].tags[tagId[1]].name
  //   };
  // });
}
