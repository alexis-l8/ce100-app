var Hoek = require('hoek');
var fs = require('fs');
var path = require('path');

module.exports = (request, reply) => {
  var tagsdir = path.join(__dirname, '../../tags/');
  fs.readdir(`${tagsdir}/`, (error, files) => {
    Hoek.assert(!error, error);
    var jsonFiles = files.filter(file => file.substr(-5) === ('.json'))
                         .map(json => require(`${tagsdir}/${json}`))
                         .reduce((prev, current) => prev.concat(current));
    reply.view('tags', { tags: jsonFiles });
  });
};
