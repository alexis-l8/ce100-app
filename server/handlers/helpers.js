var helpers = {};

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

helpers.removeUserFromOrg = (orgString, userId) => {
  var org = JSON.parse(orgString);
  var newInfo = {
    primary_id: -1,
    people: org.people.filter(u => u.id !== userId)
  };
  var updatedOrg = Object.assign({}, org, newInfo);
  return JSON.stringify(updatedOrg);
};

helpers.orgsDropdown = (stringifiedOrgs, stringifiedUser) => {
  var user = typeof stringifiedUser === 'string' ? JSON.parse(stringifiedUser) : false;
  var orgsArray = stringifiedOrgs.map(orgString => {
    var org = JSON.parse(orgString);
    return {
      value: org.id,
      display: org.name,
      isDisabled: org.primary_id > -1 && user.organisation_id !== org.id,
      isSelected: user.organisation_id === org.id
    };
  });
  return { allOrganisations: orgsArray };
};

helpers.userTypeRadios = (userString) => {
  // default to primary
  var checkedType = userString ? JSON.parse(userString).user_type : 'primary';
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

helpers.initialiseEntry = (length, payload) => {
  var additionalInfo = {
    id: length,
    active: true
  };
  var updatedUser = Object.assign(additionalInfo, payload);
  return JSON.stringify(updatedUser);
};

helpers.addPrimaryToOrg = (user, org) => {
  var id = JSON.parse(user).id;
  var orgOld = JSON.parse(org);
  var additionalInfo = {
    primary_id: id,
    people: orgOld.people.push(id)
  };
  var orgUpdated = Object.assign({}, orgOld, additionalInfo);
  return JSON.stringify(orgUpdated);
};

helpers.addPasswordToUser = (hashed, user) => {
  var userOld = JSON.parse(user);
  var newDetails = {
    password: hashed,
    last_login: Date.now()
  };
  var updatedUser = Object.assign(newDetails, userOld);
  return JSON.stringify(updatedUser);
};

// add the names to all tagIds that this function receives
helpers.getTagNames = (redis, tagIds, callback) => {
  var Hoek = require('hoek');
  redis.HGET('tags', 'tags', (error, response) => {
    Hoek.assert(!error, error);
    var allTags = JSON.parse(response);
    var tags = tagIds.map(helpers.getTagFromId(allTags));
    callback(tags);
  });
};

helpers.getChallenges = (redis, challenges, ids, callback) => {
  var Hoek = require('hoek');
  redis.HGET('tags', 'tags', (error, response) => {
    Hoek.assert(!error, error);
    var allTags = JSON.parse(response);
    var challengeArr = ids.map(id => {
      var challengeCard = challenges[id];
      var tagsData = challengeCard.tags.map(helpers.getTagFromId(allTags));
      return Object.assign({}, challengeCard, {tagsData});
    });
    challengeArr.length === 0 ? callback(false) : callback(challengeArr);
  });
};

// map through the inner function which takes a tag id, and returns named object for that tag
helpers.getTagFromId = (allTags) => (id) => {
  return id && allTags[id[0]] && allTags[id[0]].tags[id[1]] && {
    id: id,
    name: allTags[id[0]].tags[id[1]].name
  };
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

helpers.errorOptions = (err) =>
  // if there is no error, return falsey
  err && {
    values: err.data._object,
    message: err.data.details[0].message.split('"').join('').split('_').join(' ').split('-').join(' '),
    [err.data.details[0].path]: 'form__input-error'
  };

module.exports = helpers;

// Leaving these helpers in here but they are not currently used
//
// helpers.ironUnencrypt = (encrypted, callback) => {
//   Iron.unseal(encrypted, process.env.COOKIE_PASSWORD, Iron.defaults,
//     (error, unencrypted) => callback(error, unencrypted));
// };
//
// helpers.hashPassword = (rawPassword, callback) => {
//   bcrypt.hash(rawPassword, 13,
//     (error, hashedPassword) => callback(error, hashedPassword));
// };
//
// helpers.handleMultipleFunctions = (functions, callback) => {
//   var errors = [];
//   var responses = [];
//
//   var collectResponse = (i, next) => (error, response) => {
//     // if (error) errors[i] = error;
//     Hoek.assert(!error, error);
//     responses[i] = response;
//     next();
//   };
//
//   functions.forEach((fn, index) => {
//     fn(collectResponse(index, () => {
//       if (index === functions.length - 1) callback(errors, responses);
//     }));
//   });
// };
//
// // ~~~~~~~~~~~~~~~~~~~~REDIS FUNCTIONS~~~~~~~~~~~~~~~~~~~~~~ //
//
// helpers.getAll = (listName, redis, callback) => {
//   redis.LRANGE(listName, 0, -1, (error, items) => {
//     var all = items.map(element => JSON.parse(element));
//     callback(error, all);
//   });
// };
//
// helpers.getItem = (listName, itemId, returnSpecifics, redis, callback) => {
//   redis.LINDEX(listName, itemId, (error, item) => {
//     var itemObj = JSON.parse(item);
//     if (returnSpecifics) {
//       var requestedDetails = {};
//       returnSpecifics.forEach((value, index) => {
//         requestedDetails[value] = itemObj[value];
//         if (index === returnSpecifics.length - 1) callback(error, requestedDetails);
//       });
//     } else {
//       callback(error, itemObj);
//     }
//   });
// };
//
// helpers.getListLength = (listName, redis, callback) => {
//   redis.LLEN(listName, (error, response) => callback(error, response));
// };
//
// helpers.addItem = (listName, object, redis, callback) => {
//   redis.RPUSH(listName, object, (error, response) =>
//     callback(error, response));
// };
//
// helpers.setItem = (listName, itemId, object, redis, callback) => {
//   redis.LSET(listName, itemId, object, (error, response) =>
//     callback(error, response));
// };
//
// helpers.setSession = (hashName, key, value, redis, callback) => {
//   redis.HSET(hashName, key, value, (error, response) =>
//     callback(error, response));
// };
//
// module.exports = helpers;
