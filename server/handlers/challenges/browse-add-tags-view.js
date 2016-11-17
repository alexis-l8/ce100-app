'use strict';

var helpers = require('../helpers.js');

/**
* Switch out redis --> postgres:
* Build 'options' object, simplify
*/

module.exports = function (request, reply) {
  var permissions = helpers.getPermissions(request.auth.credentials);
  request.redis.HGET('tags', 'tags', (error, allTags) => {
    var parent_tags = JSON.parse(allTags);
    var searchAll = 'challenges';
    var options = Object.assign({}, {searchAll}, {parent_tags}, permissions);
    reply.view('browse/tags', options);
  });
};
