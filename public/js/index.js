var logoSaver = (function () {
  var file_name;

  var saveFile = function (addedFile) {
    file_name = addedFile[0].name;
  };

  function sendFileToServer (file_name, id) {
    var orgForm =
      document.getElementById('add-org-form')
      || document.getElementById('edit-org-form');
    var formData = new FormData(orgForm);
    var xhttp = new XMLHttpRequest();

    file_name && formData.append('file_name', file_name);

    if (id) {
      xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            window.location.replace('/orgs/' + id);
          } else {
            document.write(xhttp.responseText);
          }
        }
      };
      xhttp.open('POST', '/orgs/' + id + '/edit', true);
      xhttp.send(formData);
    } else {
      xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            window.location.replace('/orgs');
          } else {
            document.write(xhttp.responseText);
          }
        }
      };
      xhttp.open('POST', '/orgs/add', true);
      xhttp.send(formData);
    }
  }

  function submitForm (id) {
    sendFileToServer(file_name, id);
  }

  return {
    saveFile: saveFile,
    submitForm: submitForm
  };
})();


// Dynamically adjust the height of the landing cards on the dashboard route #660
(function () {
  var viewportHeight = window.innerHeight;
  var cards = document.querySelectorAll('.landing-card');

  [].forEach.call(cards, function (card) {
    card.style.height = viewportHeight + 'px';
  });
})();
