var logoSaver = (function () {
  var file_name;

  var saveFile = function (addedFile) {
    console.log('saving file,', addedFile);
    file_name = addedFile[0].name;
  };

  function submitForm (id) {
    console.log('submittting , ', file_name, id);
    sendFileToServer(file_name, id);
  }

  function sendFileToServer (file_name, id) {
    var editOrgForm = document.getElementById('edit-org-form');
    var formData = new FormData(editOrgForm);
    console.log(formData);
    file_name && formData.append('file_name', file_name);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      console.log(this);
      if (this.readyState === 4) {
        console.log(this);
        if(this.status === 200) {
          window.location.replace('/orgs/' + id + '/tags');
        } else {
          document.write(xhttp.responseText);
        }
      }
    };
    xhttp.open('POST', '/orgs/' + id + '/edit', true);
    console.log(id, formData);
    xhttp.send(formData);
  }

  return {
    saveFile: saveFile,
    submitForm: submitForm
  };
})();
