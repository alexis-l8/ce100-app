var Hoek = require('hoek');
var redis = require('redis').createClient();

function storeTags (callback) {
  redis.HSET('tags', 'tags', JSON.stringify(require('./tags.json')), (error, response) => {
    Hoek.assert(!error, error);
    callback('Hello');
  });
}

storeTags(() => { redis.end(true); });
