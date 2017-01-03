'use strict';

var addModel = require('../models/add-insight.js');
var editView = require('../handlers/insights/edit-view.js');
var editSubmit = require('../handlers/insights/edit.js');

module.exports = [
  {
    method: 'GET',
    path: '/insights/{id}/edit',
    handler: editView
  },
  {
    method: 'POST',
    path: '/insights/{id}/edit',
    handler: editSubmit,
    config: { validate: addModel }
  }
];
