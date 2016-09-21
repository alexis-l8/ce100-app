
var mockPayloads = {};

mockPayloads.usersAddPayload = {
  first_name: 'Anna',
  last_name: 'Ivanovic',
  email: 'ce100.emf@gmail.com',
  organisation_id: 5,
  user_type: 'primary'
};

mockPayloads.usersActivatePayload = {
  password: 'Hello1',
  confirmPassword: 'Hello1'
};

mockPayloads.orgsAddPayload = {
  name: 'acer'
};

mockPayloads.orgsAddDB = {
  name: 'acer',
  active: true,
  mission_statement: '',
  id: 5,
  people: []
};

mockPayloads.loginAdminCorrect = {
  email: 'ja@mu.co',
  password: 'Hello1'
};

mockPayloads.loginAdminIncorrect = {
  email: 'ja@mu.co',
  password: 'Hello2'
};

mockPayloads.loginBadEmail = {
  email: 'jaaaaaa@mu.co',
  password: 'Hello1'
};

mockPayloads.editUserRemoveOrg = {
  first_name: 'Ben',
  last_name: 'Maynard',
  job: 'Full Stack Web Developer',
  email: 'be@ma.co',
  user_type: 'admin',
  organisation_id: -1
};

mockPayloads.editUserPayloadOrgUnchanged = {
  first_name: 'Ben',
  last_name: 'Maynard',
  job: 'Full Stack Web Developer',
  email: 'be@ma.co',
  user_type: 'admin',
  organisation_id: 1
};

mockPayloads.editUserAddOrg = {
  first_name: 'Anna',
  last_name: 'Freud',
  email: 'an@fr.co',
  job: 'CEO',
  organisation_id: 6,
  user_type: 'primary'
};

mockPayloads.adminEditOrg = {
  name: 'McDonalds',
  mission_statement: 'Improve diets'
};

mockPayloads.addChallenge = {
  title: 'Challenge Number 1',
  description: 'What can I...?'
};

mockPayloads.noTagsAdded = {
  tags: ''
};

mockPayloads.addOneTagOnly = {
  tags: '[0, 0]' // corresponds to tags with name: 'Global Partner'
};

mockPayloads.addTags = {
  tags: ['[0, 0]', '[2, 1]'] // corresponds to tags with names: 'Global Partner' and 'USA'
};


module.exports = mockPayloads;
