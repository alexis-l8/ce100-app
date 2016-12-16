'use strict';

var browseAddTagsView = require('../handlers/shared/browse-add-tags-view.js');
var browseOrgs = require('../handlers/orgs/browse-orgs.js');
var orgDetailsView = require('../handlers/orgs/details-view.js');
var edit = require('../handlers/orgs/edit-org.js');
var editView = require('../handlers/orgs/edit-org-view.js');
var editSchema = require('../models/admin-edit-org.js');
var toggleActive = require('../handlers/orgs/toggle-active.js');
var add = require('../handlers/orgs/add.js');
var addSchema = require('../models/admin-add-org.js');
var addTagsView = require('../handlers/orgs/add-tags-view.js');
var addTags = require('../handlers/orgs/add-tags.js');
var addView = require('../handlers/serve-view.js')('organisations/add');
var maxAllowedTags = require('../models/max-allowed-tags.js');

module.exports = [
  {
    method: 'GET',
    path: '/orgs',
    handler: browseOrgs
  },
  {
    method: 'GET',
    path: '/orgs/tags',
    handler: browseAddTagsView('orgs')
  },
  {
    method: 'GET',
    path: '/orgs/add',
    handler: addView,
    config: { auth: { scope: 'admin' } }
  },
  {
    method: 'POST',
    path: '/orgs/add',
    handler: add,
    config: {
      auth: { scope: 'admin' },
      validate: addSchema
    }
  },
  {
    method: 'GET',
    path: '/orgs/{id}',
    handler: orgDetailsView
  },
  {
    method: 'GET',
    path: '/orgs/{id}/edit',
    handler: editView
  },
  {
    method: 'POST',
    path: '/orgs/{id}/edit',
    handler: edit,
    config: { validate: editSchema }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/toggle-active',
    handler: toggleActive,
    config: { auth: { scope: 'admin' } }
  },
  {
    method: 'GET',
    path: '/orgs/{id}/tags',
    handler: addTagsView
  },
  {
    method: 'POST',
    path: '/orgs/{id}/tags',
    handler: addTags,
    config: { validate: maxAllowedTags }
  }
];
