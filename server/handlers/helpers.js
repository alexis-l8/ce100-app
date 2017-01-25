'use strict';

var url = require('url');
var helpers = {};

var INSIGHT_TYPES = [
  'CASE STUDY', 'PAPER', 'PRESENTATION', 'REPORT', 'VIDEO', 'WORKSHOP SUMMARY'
];

///// *** S3 Image Upload *** /////

// remove an array of keys that may or may not be present from an object
helpers.dissocAll = function (arr, obj) {
  return Object.keys(obj).reduce(function (newOb, key) {
    arr.indexOf(key) > -1 ? newOb : newOb[key] = obj[key]; //eslint-disable-line

    return newOb;
  }, {});
};

// remove logoand file_name, add logo_url to payload obj
helpers.preparePayload = function (payload, data) {
  var logo_url = data && data.Location;
  var strippedPayload = helpers.dissocAll(['logo', 'file_name'], payload);

  return logo_url
    ? Object.assign({}, strippedPayload, { logo_url: logo_url })
    : strippedPayload;
};
///////////////////////////////////

helpers.getPermissions = (loggedIn, key, identifier) => {
  return loggedIn && {
    permissions: {
      isMember: loggedIn[key] === identifier,
      editable: loggedIn[key] === identifier || loggedIn.scope === 'admin',
      [loggedIn.scope]: true,
      userId: loggedIn.userId,
      organisation_id: loggedIn.organisation_id
    }
  };
};

helpers.insightTypeDropdown = function (selected) {
  return INSIGHT_TYPES.map(function (type) {
    return {
      isSelected: type === selected,
      id: type,
      name: type
    };
  });
};

helpers.browseViewTabBar = function (pageType, filter) {
  return {
    id: filter && filter.id, // if not searching by a filter, filter = null
    name: filter && filter.name,
    url: filter ? '?tags=' + filter.id : '',
    [pageType]: true,
    pageType: pageType
  };
}

// we want to `select` the org that the user is attached to
helpers.editUserOrgDropdown = (orgs, user) => {
  return orgs.map(function (org) {
    return Object.assign(
      { isSelected: org.id === user.org_id },
      org
    );
  });
};


helpers.userTypeRadios = (user_type) => {
  // default to primary
  var checkedType = user_type || 'primary';
  var userTypes = ['admin', 'primary', 'secondary'];
  var userTypeArr = userTypes.map(type => {
    return {
      name: 'user_type',
      value: type,
      display: type,
      isChecked: checkedType === type
    };
  });
  return { userTypes: userTypeArr };
};


helpers.cloneArray = (arr) => arr.map(el => Object.assign({}, el));

helpers.sortAlphabetically = (key) => (arr) =>
  helpers.cloneArray(arr).sort((el1, el2) => {
    var name1 = el1[key].toUpperCase();
    var name2 = el2[key].toUpperCase();
    if (name1 < name2) {
      return -1;
    }
    if (name1 > name2) {
      return 1;
    }
    return 0;
  });


helpers.errorOptions = (err) =>
  // if there is no error, return falsey
  err && {
    values: err.data._object,
    message: err.data.details[0].message.split('"').join('').split('_').join(' ').split('-').join(' '),
    [err.data.details[0].path]: 'form__input-error'
  };



/* --------- view logic helpers ----------- */

helpers.getCancelUrl = function (req) {
  var defaultHomePage = req.auth.credentials.organisation_id
    ? '/orgs/' + req.auth.credentials.organisation_id // non-admin default
    : '/orgs'; // admin default
  var previous = url.parse(req.info.referrer).path;
  var current = req.path;

  // if the previous path is same as current, redirect to the user's default
  return current === previous ? defaultHomePage : previous;
};


module.exports = helpers;
