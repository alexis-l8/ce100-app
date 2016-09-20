
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

mockPayloads.loginPrimary = {
  email: 'sa@ro.co',
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
  email: 'sa@ro.co',
  phone: '02088884444'
};

module.exports = mockPayloads;
