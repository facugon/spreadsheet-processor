'use strict';

var FileAction = {
  upload: function(data, next){
    var xhr = new XMLHttpRequest();
    xhr.open('POST','parser?type=ventas');
    //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.response);
          next(null,data);
        } else {
          alert('An error occurred!');
        }
      }
    }
    xhr.send(data);
  }
};

module.exports = FileAction;
