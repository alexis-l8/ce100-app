var Hoek = require('hoek');
var fs = require('fs');
var path = require('path');

module.exports = (callback) => {
  fs.readFile(path.join(__dirname, 'tags.csv'), (error, data) => {
    Hoek.assert(!error, error);
    var csv = data.toString().toUpperCase().split(/\n/g);
    var groupReplace;
    var tagGroups = csv[0].split(/,/g).map((group, index, array) => {
      if (!group) {
        if (groupReplace) return groupReplace;
        else { groupReplace = array[index - 1]; return array[index - 1]; }
      } else return group;
    });
    var allTags = csv[1].split(/,/g).map((header, index) => {
      return {
        id: index,
        name: header,
        enabled: true,
        tags: [],
        type: tagGroups[index]
      };
    });
    var body = csv.slice(2);
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
          fs.writeFile(path.join(__dirname, 'tags.json'), JSON.stringify(allTags), (error, response) => {
            Hoek.assert(!error, error);
            callback('Hello');
          });
        }
      });
    });
  });
};
