// This file is unlikely to be used again, but we can keep here incase there is a problem with tags
// It converts the csv into a tags.json and categories.json file

var fs = require('fs');
var csv = fs.readFileSync('./tags/tags.csv', 'utf8').split('\n');

// convert to 2-D array, remove first field in each row as it is useless
var arrayFormat = csv.map(function (line) { return line.split(',').slice(1) });

// get all categories
var categories = arrayFormat[0].map(function (catName, id){
  return {
    "id": id + 1, // We want the id to start at 1
    "name": catName,
    "active": true
  }
});

// then remove categoreis from the data
var tagsOnly = arrayFormat.slice(1);

// transformation to arrange tags in order of their category
var reformattedTags = tagsOnly[0].map(function(col, i) {
  return tagsOnly.map(function(row) {
    return row[i]
  })
});

// we need to track the number of different tags so they each have a unique id
var tagId = 0;
var tags = [];

reformattedTags.map(function (categoryTags, catId) {
  categoryTags.forEach(function (tagName) {
    if(tagName !== '' && tagName !== undefined) {
      tags.push({
        "id": tagId + 1,
        "name": tagName,
        "active": true,
        "categories": [ catId + 1 ]
      });

      tagId += 1;
    }
  });
});

fs.writeFile('./tags.json', JSON.stringify(tags, null, 2));
fs.writeFile('./categories.json', JSON.stringify(categories, null, 2));
