'use strict';

var search = require('../handlers/search/search.js');

module.exports = [
  {
    method: 'GET',
    path: '/search',
    handler: search
  }
];
