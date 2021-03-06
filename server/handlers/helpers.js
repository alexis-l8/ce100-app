'use strict';

var url = require('url');
var helpers = {};

var INSIGHT_TYPES = [
  'CASE STUDY',
  'PAPER',
  'PRESENTATION',
  'REPORT',
  'VIDEO',
  'WORKSHOP SUMMARY',
  'CO.PROJECT',
  'IMAGE',
  'LINK'
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
      editable: loggedIn[key] === identifier || loggedIn.scope === 'admin' || loggedIn.scope === 'content-owner',
      userId: loggedIn.userId,
      organisation_id: loggedIn.organisation_id,
      admin: loggedIn.scope === 'admin' || loggedIn.scope === 'content-owner',
      "content-owner": loggedIn.scope === 'content-owner',
      primary: loggedIn.scope === 'primary',
      secondary: loggedIn.scope === 'secondary',
      superadmin: loggedIn.scope === 'admin'
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
  var userTypes = ['admin', 'content-owner', 'primary', 'secondary'];
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


// move the category with name `location` to the end of the list as requested
helpers.locationCategoryToEnd = function (categories) {
    // location of the LOCATION category in the categories array
    var ind = categories.map(function (cat) {
      return cat.category_name.toUpperCase();
    }).indexOf("LOCATION");

    // if this list of categories contains one with name location, then shift it to the bottom
    return ind > -1
      ? categories.slice(0, ind).concat(categories.slice(ind + 1)).concat(categories[ind])
      : categories

  }


/* --------- view logic helpers ----------- */

helpers.getCancelUrl = function (req) {
  var defaultHomePage = req.auth.credentials.organisation_id
    ? '/orgs/' + req.auth.credentials.organisation_id // non-admin default
    : '/orgs'; // admin default
  var previous = url.parse(req.info.referrer).path || '';
  var current = req.path;

  // if the previous path is same as current, redirect to the user's default
  return (current === previous || previous.indexOf('/edit') > -1 || previous.indexOf('/add') > -1) ? defaultHomePage : previous;
};

helpers.getView = function (url) {
  var numbers = /[0-9]+/g;
  var path = url.match(numbers) ? url.replace(numbers, '*') : url;
  switch (path) {
    case '/orgs':
    case '/insights':
    case '/challenges':
      return { explore: true };
    case '/challenges/add':
    case '/challenges/*/tags':
      return { 'add-chal': true };
    case '/orgs/*':
      return { 'profile': true };
    default:
      return {};
  }
};

helpers.getTagArray = function (tagsPayload) {

  if (tagsPayload === undefined) {
    return [];
  }

  if (typeof tagsPayload === 'string') {
    return [parseInt(tagsPayload, 10)];
  }

  return tagsPayload.map(function (tag) {
    return parseInt(tag, 10);
  });
}

module.exports = helpers;
