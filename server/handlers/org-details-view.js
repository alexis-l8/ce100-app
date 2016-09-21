var Hoek = require('hoek');

module.exports = (request, reply) => {
  var orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    var organisation = JSON.parse(stringifiedOrg);
    var orgDetails = {
      organisation: organisation
    };
    if (organisation.primary_id === -1 && organisation.challenges.length === 0) {
      return reply.view('organisations/details', orgDetails);
    } else {
      request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
        Hoek.assert(!error, 'redis error');
        var {first_name, last_name, email, phone, job} = JSON.parse(stringifiedPrimaryUser);
        orgDetails.primary_user = Object.assign({}, {first_name, last_name, email, phone, job});
        if (organisation.challenges.length > 0) {
          request.redis.LRANGE('challenges', 0, -1, (error, challengesList) => {
            Hoek.assert(!error, 'redis error');
            orgDetails.challenges = organisation.challenges.map((challengeId, index) => {
              var challengeCard = JSON.parse(challengesList[challengeId]);
              var tagsArray = getTagNames(challengeCard.tags);
              return Object.assign({}, challengeCard, {tags: tagsArray});
            });
            reply.view('organisations/details', orgDetails);
          });
        } else {
          reply.view('organisations/details', orgDetails);
        }
      });
    }
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
