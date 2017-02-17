'use strict';

var Backbone = require('backbone');

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
    var $container = this.$el;
    for (var col in this.model.attributes) {
      var cell = new CellView({
        model: new Backbone.Model(this.model.attributes[col])
      });
      cell.render();
      cell.$el.appendTo($container);
    }
  }
});

var TableBody = Backbone.View.extend({
  render: function(){
    Backbone.View.prototype.render.apply(this);
    var $container = this.$el;
    $container.empty();
    this.collection.forEach(function(row){
      var rowView = new RowView({ model: row });
      rowView.render();
      rowView.$el.appendTo($container);
    });
  }
});

module.exports = TableBody;
