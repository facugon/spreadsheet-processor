'use strict';

var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    path.join(__dirname, 'client/main.js')
  ],
  output: {
    path: path.join(__dirname, '/public/'),
    filename: 'js/[name].bundle.js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'client/layout.hbs',
      inject: 'body',
      filename: path.join(__dirname, '/views/layout.hbs')
    }),
  ]
}
