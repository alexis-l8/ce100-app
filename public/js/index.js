var logoSaver = (function () {
  var file_name;

  var saveFile = function (addedFile) {
    file_name = addedFile[0].name;
  };

  function sendFileToServer (file_name, id) {
    var editOrgForm = document.getElementById('edit-org-form');
    var formData = new FormData(editOrgForm);
    var xhttp = new XMLHttpRequest();

    file_name && formData.append('file_name', file_name);
    xhttp.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          window.location.replace('/orgs/' + id + '/tags');
        } else {
          document.write(xhttp.responseText);
        }
      }
    };
    xhttp.open('POST', '/orgs/' + id + '/edit', true);
    xhttp.send(formData);
  }

  function submitForm (id) {
    sendFileToServer(file_name, id);
  }

  return {
    saveFile: saveFile,
    submitForm: submitForm
  };
})();
