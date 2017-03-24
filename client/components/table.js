'use strict';

const View = require('ampersand-view')
const $ = require('jquery')
const Model = require('ampersand-model')

var CellView = View.extend({
  autoRender: true,
  template:`<td data-hook="value"></td>`,
  props: {
    value: 'string'
  },
  bindings: {
    value: {
      hook: 'value'
    }
  },
  render () {
    this.renderWithTemplate(this)

    var err = this.model.error
    var val = this.model.w

    if (err) {
      this.value = err
      this.el.style.color = 'red'
    } else {
      this.value = val
    }
  }
})

var CellData = Model.extend({
  props: {
    f: 'any',
    t: 'any',
    v: 'any',
    w: 'string',
    error: 'string'
  }
})

var RowView = View.extend({
  autoRender: true,
  template : `<tr></tr>`,
  render () {
    this.renderWithTemplate(this)

    if ( Object.keys(this.model._values).length === 0 ) return

    for (var col in this.model._values) {
      var cell = new CellView({
        model:  new CellData( this.model._values[col])
      })

      this.renderSubview(cell, this.query('tr'))
    }
  }
});

module.exports = View.extend({
  template: `<tbody></tbody>`,
  render () {
    this.renderWithTemplate(this)

    this.renderCollection(
      this.collection,
      RowView,
      this.query('tbody')
    )
  }
})
