var hasPrimary = function (primary_id, context) {
  console.log('in handlebarssss');

  if(primary_id === -1){
    return context.inverse(this);
  }
  else {
    return context.fn(this);
  }
};

module.exports = hasPrimary;
