'use strict';

const View = require('ampersand-view')
const $ = require('jquery')
const FileAction = require('../../actions/file');

module.exports = View.extend({
  events: {
    submit: 'onSubmitForm'
  },
  onSubmitForm (event) {
    event.preventDefault();

    var self = this
    var $el = $(this.el)

    var files = $el.find('input[type=file]')[0].files;
    var file = files[0];

    if (!file) {
      alert('seleccione un archivo para procesar');
      return;
    }

    // Check the file type.
    if (!file.type.match('application/.*.spreadsheetml.sheet')) {
      alert('elija un archivo XLS');
      return;
    }

    var form = new FormData($el[0]);

    var button = $el.find('button')[0];
    // Update button text.
    button.innerHTML = 'Uploading...';

    // submit file
    FileAction.upload(form, function(err,data){
      button.innerHTML = 'Start Upload';
      self.trigger('uploaded',data);
    });

    // The rest of the code will go here...
    event.stopPropagation();
    return false;
  }
})
