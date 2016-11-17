'use strict';

var helpers = require('./helpers.js');

/**
* Switch out redis --> postgres:
* Build 'options' object, simplify
*/

module.exports = (request, reply) => {
  var permissions = helpers.getPermissions(request.auth.credentials);
  // request.getTags(function (err, allTags) {
  // });
  request.redis.HGET('tags', 'tags', (error, allTags) => {
    var parent_tags = JSON.parse(allTags);
    // Define which of the tabs are selected --> 'orgs' or 'challenges' view
    var view = { [request.route.path.split('/')[1]]: true };
    var options = Object.assign({}, {view}, {parent_tags}, permissions);
    reply.view('browse/tags', options);
  });
};
