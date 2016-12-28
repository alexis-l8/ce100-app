'use strict';

var addTagsView = require('../handlers/insights/add-tags-view.js');
var addTags = require('../handlers/insights/add-tags.js');
var maxAllowedTags = require('../models/max-allowed-tags.js');

module.exports = [
  {
    method: 'GET',
    path: '/insights/{id}/tags',
    handler: addTagsView
  },
  {
    method: 'POST',
    path: '/insights/{id}/tags',
    handler: addTags,
    config: { validate: maxAllowedTags }
  }
];
