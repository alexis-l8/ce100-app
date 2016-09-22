var Hoek = require('hoek');
var helpers = require('./helpers');

module.exports = (request, reply) => {
  var orgId = +request.params.id;
  var permissions = helpers.getPermissions(request.auth.credentials, 'organisation_id', orgId);
  if (orgId === -1) {
    return reply.redirect('/orgs');
  }
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);

    if (organisation.primary_id === -1 && organisation.challenges.length === 0) {
      var options = Object.assign({}, {organisation}, permissions);
      return reply.view('organisations/details', options);
    }
    request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
      Hoek.assert(!error, 'redis error');
      var {first_name, last_name, email, phone, job_title} = JSON.parse(stringifiedPrimaryUser);
      var primary_user = {first_name, last_name, email, phone, job_title};
      var options = Object.assign({}, {primary_user}, {organisation}, permissions);

      if (organisation.challenges.length === 0) {
        return reply.view('organisations/details', options);
      }
      request.redis.LRANGE('challenges', 0, -1, (error, challengesList) => {
        Hoek.assert(!error, 'redis error');
        options.challenges = organisation.challenges.map((challengeId, index) => {
          var challengeCard = JSON.parse(challengesList[challengeId]);
          var tagsArray = getTagNames(challengeCard.tags);
          return Object.assign({}, challengeCard, {tags: tagsArray});
        });
        reply.view('organisations/details', options);
      });
    });
  });
};

function getTagNames (tagIds) {
  var allTags = require('../../tags/tags.json');
  return tagIds.map(tagId => {
    return {
      id: tagId,
      name: allTags[tagId[0]].tags[tagId[1]].name
    };
  });
}
