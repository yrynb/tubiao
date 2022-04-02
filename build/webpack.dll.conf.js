const path = require('path')
const config = require('../config')
const webpack = require('webpack')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: {
    libs: ['vue', 'vue-router', 'vuex', 'axios'],
    libs2: ['html2canvas', 'marked']
  },
  output: {
    path: path.resolve(__dirname, '../static/js'), // 打包后文件输出的位置
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '.', '[name]-manifest.json'),
      name: '[name]_library',
      context: __dirname // 执行的上下文环境，对之后DllReferencePlugin有用
    }),
    new TerserWebpackPlugin({
      exclude: /\.min\.js$/,
      cache: true,
      parallel: true, // 开启并行压缩，充分利用cpu
      extractComments: true, // 移除注释
      terserOptions: {
        output: {
          comments: false // 保留所有的注释
        },
        compress: {
          drop_debugger: true,
          drop_console: true // 删除所有的 `console` 语句，可以兼容ie浏览器
        }
      }
    }),
    new CompressionWebpackPlugin({
      test: new RegExp(
        '\\.(' + config.build.productionGzipExtensions.join('|') + ')$'
      ),
      threshold: 1024
    })
  ]
}
