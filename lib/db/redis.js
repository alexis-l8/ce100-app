const redis = {};

const redisCB = cb => (err, res) => err ? cb(err) : cb(null, res);

redis.addUser = (client, user, cb) => {
  client.hmset(user.key, 'first_name', user.first_name, redisCB(cb));
};

redis.getUser = (client, key, cb) => {
  client.hgetall(key, redisCB(cb));
};

module.exports = redis;
