'use strict';

var helpers = {};

helpers.assetToInsight = function(asset) {
  return {
    id: asset.id,
    title: asset.name,
    url: asset.file || asset.link || "",
    type: getType(asset.type_field),
    author: 'TODO'
  }
};

function getType(typeField) {
  var types = {
    'CS': 'CASE STUDY',
    'CP': 'CO.PROJECT',
    'IM': 'IMAGE',
    'LN': 'LINK',
    'PA': 'PAPER',
    'PR': 'PRESENTATION',
    'RT': 'REPORT',
    'VI': 'VIDEO',
    'WS': 'WORKSHOP SUMMARY'
  };
  return types[typeField];
}

module.exports = helpers;
