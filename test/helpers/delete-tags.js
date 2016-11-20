'use strict';

var query = require('pg-helpers').query;

module.exports = function (pool, cb) {
  var querySql = 'truncate tags_categories cascade;' +
    'truncate tags cascade;' +
    'truncate categories cascade;';

  return query(querySql, pool, cb);
};
