'use strict';

var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack')

module.exports = {
  devtool: '#inline-source-map',
  entry: [
    path.join(__dirname, 'client/main.js')
  ],
  output: {
    path: path.join(__dirname, '/public/'),
    filename: 'js/[name].bundle.js',
    publicPath: '/'
  },
  resolve: {
    //extensions: ['', '.js', '.jsx', '.json'],
    alias: {
    },
    modulesDirectories: [
      'node_modules',
      'client'
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    }),
    new HtmlWebpackPlugin({
      template: 'client/layout.hbs',
      inject: 'body',
      filename: path.join(__dirname, '/views/layout.hbs')
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          'presets': ['es2015', 'stage-0']
        }
      },
      { test: /\.hbs$/, loader: 'handlebars-loader' },
      { test: /\.json$/, loader: 'json' }
    ]
  }
}
