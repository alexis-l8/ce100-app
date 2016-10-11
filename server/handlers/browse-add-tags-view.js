var helpers = require('./helpers.js');
module.exports = (request, reply) => {
  var permissions = helpers.getPermissions(request.auth.credentials);
  request.redis.HGET('tags', 'tags', (error, allTags) => {
    var parent_tags = JSON.parse(allTags);
    var view = { [request.route.path.split('/')[1]]: true };
    var options = Object.assign({}, {view}, {parent_tags}, permissions);
    reply.view('browse/tags', options);
  });
};
