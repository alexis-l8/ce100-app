var R = {};

R.dissocAll = function (arr, obj) {
  var newOb = {};
  var k;
  for (k in obj) {
    if (arr.indexOf(k) === -1) newOb[k] = obj[k];
  }
  return newOb;
};

module.exports = R;
