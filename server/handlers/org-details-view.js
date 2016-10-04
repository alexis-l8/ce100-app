var Hoek = require('hoek');
var helpers = require('./helpers.js');

module.exports = (request, reply) => {
  var orgId = parseInt(request.params.id, 10);
  var permissions = helpers.getPermissions(request.auth.credentials, 'organisation_id', orgId);
  if (orgId === -1) {
    return reply.redirect('/orgs');
  }
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    // TODO: catch for case where org at specified userId doesn't exist.
    var organisation = JSON.parse(stringifiedOrg);
    helpers.getTagNames(request.redis, organisation.tags, organisationTags => {
      organisation.tags = organisationTags;

      // get all challenges
      request.redis.LRANGE('challenges', 0, -1, (error, challengesList) => {
        Hoek.assert(!error, 'redis error');
        getChallenges(request.redis, challengesList, organisation.challenges, challenges => {

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
    });
  });
};

function getUserInfo (stringifiedUser) {
  var { first_name, last_name, email, phone, job_title } = JSON.parse(stringifiedUser);
  return {first_name, last_name, email, phone, job_title};
}

function getChallenges (redis, challengesList, organisationChallenges, callback) {
  var Hoek = require('hoek');
  redis.HGET('tags', 'tags', (error, response) => {
    Hoek.assert(!error, error);
    var allTags = JSON.parse(response);
    var challengeArr = organisationChallenges.map((challengeId, index) => {
      var challengeCard = JSON.parse(challengesList[challengeId]);
      var tagsArray = challengeCard.tags && challengeCard.tags.map(tagId => {
        return {
          id: tagId,
          name: allTags[tagId[0]].tags[tagId[1]].name
        };
      });
      return Object.assign({}, challengeCard, {tags: tagsArray});
    });
    var activeChallenges = challengeArr.filter(challenge => challenge.active);
    challengeArr.length === 0 ? callback(false) : callback(activeChallenges);
  });
}
