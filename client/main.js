'use strict';

var Backbone = require('backbone');

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

var CellView = Backbone.View.extend({
  tagName:'td',
  render:function(){
    var err, val;
    if (err = this.model.get('error')) {
      val = err;
      this.$el.css('color','red');
    } else {
      val = this.model.get('w');
    }
    this.$el.html(val);
  }
});
var RowView = Backbone.View.extend({
  tagName:'tr',
  render:function(){
    if (Object.keys(this.model.attributes).length===0) return;

    Backbone.View.prototype.render.apply(this);
    var container = this.$el;
    for (var col in this.model.attributes) {
      var cell = new CellView({
        model: new Backbone.Model(this.model.attributes[col])
      });
      cell.render();
      cell.$el.appendTo(container);
    }
  }
});
var TableBody = Backbone.View.extend({
  render: function(){
    Backbone.View.prototype.render.apply(this);
    var container = this.$el;
    this.collection.forEach(function(row){
      var rowView = new RowView({ model: row });
      rowView.render();
      rowView.$el.appendTo(container);
    });
  }
});

var Row = Backbone.Model.extend();
var Rows = Backbone.Collection.extend({ model: Row });

var FileForm = Backbone.View.extend({
  events:{
    'submit':'onSubmitForm'
  },
  onSubmitForm: function(event) {
    event.preventDefault();

    var $el = this.$el;

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

    var form = new FormData(this.$el[0]);

    var button = $el.find('button')[0];
    // Update button text.
    button.innerHTML = 'Uploading...';

    // submit file
    FileAction.upload(form, function(err,data){
      button.innerHTML = 'Start Upload';
      var table = new TableBody({
        el: document.getElementById('table-body'),
        collection: new Rows(data)
      });
      table.render();
    });

    // The rest of the code will go here...
    event.stopPropagation();
    return false;
  }
});

var DocsView = Backbone.View.extend({
  events:{
    'click': function(event){
      if (!this.attributes.visible) {
        this.attributes.visible = true;
        this.$el.find('table').slideDown();
      } else {
        this.attributes.visible = false;
        this.$el.find('table').slideUp();
      }
    }
  }
});

var App = {
  start: function(){
    console.log('app started');

    var docs = new DocsView({
      el: document.getElementById('doc-formato'),
      attributes: {
        visible: false
      }
    });

    var form = new FileForm({
      el: document.getElementById('file-form')
    });

  }
};

(function(){

  App.start();

})();
