'use strict';

var browseInsights = require('../handlers/insights/browse-insights');

module.exports = [
  {
    method: 'GET',
    path: '/insights',
    handler: browseInsights
  }
];
