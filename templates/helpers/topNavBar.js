module.exports = function(type, typeExpected) {
  var types = typeExpected.split(' ');
  return types.indexOf(type) > -1;
}
