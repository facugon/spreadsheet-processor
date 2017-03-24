'use strict'

var TableView = require('./components/table')
var FileForm = require('./components/forms/file')

const View = require('ampersand-view')
const Model = require('ampersand-model')
const Collection = require('ampersand-collection')

var Row = Model.extend({ extraProperties: 'allow' })
var Rows = Collection.extend({ model: Row })

var DocsView = View.extend({
  events:{
    click: function (event) {
      if (!this.attributes.visible) {
        this.attributes.visible = true
        this.$el.find('table').slideDown()
      } else {
        this.attributes.visible = false
        this.$el.find('table').slideUp()
      }
    }
  }
})

var App = {
  start: function () {
    console.log('app started')

    var docs = new DocsView({
      el: document.getElementById('doc-formato'),
      attributes: {
        visible: false
      }
    })

    var form = new FileForm({
      el: document.getElementById('file-form')
    })

    form.on('uploaded', function(data){

      var table = new TableView({
        el: document.getElementById('table-body'),
        collection: new Rows(data)
      })

      table.render()

    })
  }
}

App.start()
