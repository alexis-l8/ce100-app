module.exports = [].concat(
  require('./routes/generic.js'),
  require('./routes/auth.js'),
  require('./routes/challenges.js'),
  require('./routes/orgs.js'),
  require('./routes/people.js')
);
