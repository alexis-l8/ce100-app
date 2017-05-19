module.exports = function(isActive, accountActivated, status) {
  if (status === "active") {
    return isActive && accountActivated;
  }
  if (status === "inactive") {
    return !isActive;
  }
  if (status === "pending") {
    return isActive && !accountActivated;
  }
}
