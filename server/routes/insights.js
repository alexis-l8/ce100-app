'use strict';

var toggleActive = require('../handlers/insights/toggle-active.js');

module.exports = [
  {
    method: 'GET',
    path: '/insights/{id}/toggle-active',
    handler: toggleActive
  }
];
