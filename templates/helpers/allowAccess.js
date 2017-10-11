module.exports = function(permissions) {
  return permissions.superadmin || (permissions.primary && permissions.editable);
}
