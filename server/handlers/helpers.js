var helpers = {};

var INSIGHT_TYPES = [
  'CASE STUDY', 'PAPER', 'PRESENTATION', 'REPORT', 'VIDEO', 'WORKSHOP SUMMARY'
];

helpers.getPermissions = (loggedIn, key, identifier) => {
  return loggedIn && {
    permissions: {
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

helpers.removeLinkedOrgs = (orgs, userId) => {
  return orgs.filter((org) => {
    return org.active_primary_user === null || org.active_primary_user === userId;
  })
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
  // first remove linked orgs
  return helpers.removeLinkedOrgs(orgs, user.id)
    .map(org => {
      return Object.assign({ isSelected:  org.id === user.org_id }, org);
    });
};

helpers.removeUserFromOrg = (orgString, userId) => {
  var org = JSON.parse(orgString);
  var newInfo = {
    primary_id: -1,
    people: org.people.filter(u => u.id !== userId)
  };
  var updatedOrg = Object.assign({}, org, newInfo);
  return JSON.stringify(updatedOrg);
};


helpers.userTypeRadios = (user_type) => {
  // default to primary
  var checkedType = user_type || 'primary';
  var userTypes = ['admin', 'primary'];
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

helpers.toggleActivate = (stringifiedData) => {
  var data = JSON.parse(stringifiedData);
  var updated = Object.assign({}, data, { active: !data.active });
  return JSON.stringify(updated);
};

helpers.toggleActivateUser = (stringifiedData) => {
  var data = JSON.parse(stringifiedData);
  var updated = Object.assign({}, data, { active: !data.active, organisation_id: -1 });
  return JSON.stringify(updated);
};

helpers.deactivate = (stringifiedData) => {
  var data = JSON.parse(stringifiedData);
  var updated = Object.assign({}, data, { active: !data.active });
  return JSON.stringify(updated);
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

helpers.sortByDate = (arr) =>
  arr && arr.length > 0 && helpers.cloneArray(arr).sort((ch1, ch2) => ch2.date - ch1.date);

helpers.filterActive = (arr) => {
  return arr ? arr.filter((el) => el.active) : false;
};

helpers.parseArray = (arr) => arr.map(el => JSON.parse(el));

// map through the inner function which takes a tag id, and returns named object for that tag
helpers.getTagFromId = (allTags) => (id) =>
  id && allTags[id[0]] && allTags[id[0]].tags[id[1]] && {
    id: id,
    name: allTags[id[0]].tags[id[1]].name
  };

helpers.errorOptions = (err) =>
  // if there is no error, return falsey
  err && {
    values: err.data._object,
    message: err.data.details[0].message.split('"').join('').split('_').join(' ').split('-').join(' '),
    [err.data.details[0].path]: 'form__input-error'
  };

module.exports = helpers;
