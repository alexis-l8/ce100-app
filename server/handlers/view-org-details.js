var Hoek = require('hoek');

module.exports = (request, reply) => {
  var orgId = request.params.id;
  request.redis.LINDEX('organisations', orgId, (error, stringifiedOrg) => {
    Hoek.assert(!error, 'redis error');
    // TODO: catch for case where org at specified orgId doesn't exist.
    var organisation = JSON.parse(stringifiedOrg);
    var orgDetails = {organisation: organisation};
    if (orgDetails.organisation.primary_id === -1 && orgDetails.organisation.challenges.length === 0) {
      return reply.view('organisations/details', orgDetails);
    } else {
      request.redis.LINDEX('people', organisation.primary_id, (error, stringifiedPrimaryUser) => {
        Hoek.assert(!error, 'redis error');
        var {first_name, last_name, email, phone, job} = JSON.parse(stringifiedPrimaryUser);
        orgDetails.primary_user = Object.assign({}, {first_name, last_name, email, phone, job});
        if (organisation.challenges.length > 0) {
          request.redis.LRANGE('challenges', 0, -1, (error, allChallenges) => {
            Hoek.assert(!error, 'redis error');
            var allTags = require('../../tags/tags.json');
            orgDetails.challenges = organisation.challenges.map(orgChallengeId => {
              var detail = JSON.parse(allChallenges.filter(challenge => JSON.parse(challenge).id === orgChallengeId)[0]);
              // if (detail.tags.length > 1) {
              //   detail.tags = detail.tags.map(tagId => {
              //     return {
              //       id: tagId,
              //       name: allTags[tagId[0]].tags[tagId[1]].name
              //     };
              //   });
              // } else {
                detail.tags = {
                  id: detail.tags,
                  name: allTags[detail.tags[0]].tags[detail.tags[1]].name
                };
              // }
              // return detail;
            });
            // reply.view('organisations/details', orgDetails);
          });
        } else {
          orgDetails.challenges = false;
          reply.view('organisations/details', orgDetails);
        }
      });
    }
  });
};
