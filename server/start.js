const server = require('./server.js');

const callback = (err) => {
  if (err) { throw err; }
  console.log(`Server running at port: ${server.info.uri}`);
};
server.start(callback);
