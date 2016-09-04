const redis = require('redis');
const bluebird = require('bluebird');
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const setupData = require('./setup-data.js');

const dbSetup = {};

const addInitialPeople = (people) => {
  const stringifiedPeople = people.map(p => JSON.stringify(p));
  client.RPUSH('people', stringifiedPeople, (error, response) => {
    if(error) console.log(error);
    else { console.log(response); }
  });
};

const addInitialOrgs = (orgs) => {
  const stringifiedOrgs = orgs.map(o => JSON.stringify(o));
  client.RPUSH('organisations', stringifiedOrgs, (error, response) => {
    if(error) console.log(error);
    else { console.log(response); }
  });
};

dbSetup.initialiseDB = () => {
  client.flushdbAsync()
    .then(res => client.rpushAsync('people', stringified(people))
    .then(res => client.rpushAsync('organisations', stringified(orgs))
    .catch()
};
module.exports = dbSetup;

client.quit();
