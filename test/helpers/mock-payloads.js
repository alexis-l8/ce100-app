
var mockPayloads = {};

mockPayloads.usersAddPayload = {
  first_name: 'Anna',
  last_name: 'Ivanovic',
  email: 'ce100.emf@gmail.com',
  organisation_id: 5,
  user_type: 'primary'
};

mockPayloads.newUserRepeatedName = {
  first_name: 'Ben',
  last_name: 'Matthews',
  email: 'ben@mat.co',
  phone: '07111111112',
  organisation_id: 6,
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

mockPayloads.loginAdmin = {
  email: 'admin@mu.co',
  password: 'adminadmin'
};

mockPayloads.loginAdminIncorrect = {
  email: 'admin@mu.co',
  password: 'Hello2'
};

mockPayloads.loginBadEmail = {
  email: 'jaaaaaa@mu.co',
  password: 'adminadmin'
};

mockPayloads.loginPrimary = {
  email: 'sa@ro.co',
  password: 'Hello1'
};

mockPayloads.primary3Login = {
  email: 'be@ma.co',
  password: 'Hello1'
};

mockPayloads.editUserRemoveOrg = {
  first_name: 'Ben',
  last_name: 'Maynard',
  job_title: 'Full Stack Web Developer',
  email: 'be@ma.co',
  user_type: 'admin',
  organisation_id: -1
};

mockPayloads.editUserPayloadOrgUnchanged = {
  first_name: 'Ben',
  last_name: 'Maynard',
  job_title: 'Full Stack Web Developer',
  email: 'be@ma.co',
  user_type: 'admin',
  organisation_id: 1
};

mockPayloads.editUserAddOrg = {
  first_name: 'Anna',
  last_name: 'Freud',
  email: 'an@fr.co',
  job_title: 'CEO',
  organisation_id: 6,
  user_type: 'primary'
};

mockPayloads.adminEditOrg = {
  name: 'McDonalds',
  mission_statement: 'Improve diets'
};

mockPayloads.primaryEdit = {
  first_name: 'Sally',
  last_name: 'Robbins',
  job_title: 'Athlete',
  phone: '02088884444'
};

mockPayloads.primaryEditOrg = {
  mission_statement: 'Ice cream for all!'
};

mockPayloads.addChallenge = {
  title: 'Challenge Number 1',
  description: 'What can I...?'
};

mockPayloads.addChallenge2 = {
  title: 'Challenge Number 2',
  description: 'How can I...?'
};

mockPayloads.addChallenge3 = {
  title: 'How to extract oil',
  description: 'I want to extract olive oil.'
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

mockPayloads.primaryEdit = {
  first_name: 'Sally',
  last_name: 'Robbins',
  job_title: 'Athlete',
  phone: '02088884444'
};

mockPayloads.updateChallengeCardTitleAndDescription = {
  title: 'Challenge Number 4 has been updated',
  description: 'Did the dinosaurs die out because of the beetles?'
};

module.exports = mockPayloads;
