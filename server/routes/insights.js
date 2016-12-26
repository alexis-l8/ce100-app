'use strict';

var browseInsights = require('../handlers/insights/browse-insights.js');
var addView = require('../handlers/insights/add-view.js');

module.exports = [
  {
    method: 'GET',
    path: '/insights',
    handler: browseInsights
  },
  {
    method: 'GET',
    path: '/insights/add',
    handler: addView
  }
];
