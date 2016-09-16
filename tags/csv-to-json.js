var Hoek = require('hoek');
var fs = require('fs');
var path = require('path');

module.exports = (fileName, callback) => {
  fs.readFile(path.join(__dirname, fileName), (error, data) => {
    Hoek.assert(!error, error);
    var csv = data.toString().split(/\n/g);
    var allTags = csv[0].split(/,/g).map((header, index) => {
      return {
        id: index,
        name: header,
        enabled: true,
        tags: []
      };
    });
    var body = csv.slice(1);
    body.forEach((row, rowLength) => {
      var tags = row.split(/,/g);
      tags.forEach((tag, columnLength) => {
        if (tag) {
          allTags[columnLength].tags.push({
            id: [columnLength, rowLength],
            name: tag,
            parent_id: columnLength,
            enabled: true
          });
        }
        if (rowLength === body.length - 1) {
          var jsonFile = fileName.split(/\./g).shift() + '.json';
          fs.writeFile(path.join(__dirname, jsonFile), JSON.stringify(allTags), (error, response) => {
            Hoek.assert(!error, error);
            callback();
          });
        }
      });
    });
  });
};
