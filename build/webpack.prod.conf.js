'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const env =
  process.env.NODE_ENV === 'testing'
    ? require('../config/test.env')
    : require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  performance: {
    hints: false
  },
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[name].[chunkhash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      filename: utils.assetsPath('css/[name].css'),
      chunkFilename: utils.assetsPath('css/[name].[contenthash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    // new OptimizeCSSPlugin({
    //   cssProcessorOptions: config.build.productionSourceMap
    //     ? { safe: true, map: { inline: false } }
    //     : { safe: true }
    // }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename:
        process.env.NODE_ENV === 'testing' ? 'index.html' : config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      }
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ],
  optimization: {
    runtimeChunk: {
      name: 'manifest'
    },
    minimize: true,
    minimizer: [
      // new TerserWebpackPlugin({
      //   exclude: /\.min\.js|\.worker\.js|\/libs-bundle$/,
      //   cache: true,
      //   parallel: true,
      //   sourceMap: config.build.productionSourceMap,
      //   chunkFilter: (chunk) => { // 需要加上这个，不然monaco-editor采用新的es语法，uglify无法解析
      // 		if (chunk.name == 'libs') {
      // 			return false;
      // 		}
      // 		return true
      // 	},
      //   uglifyOptions: {
      //     warnings: false
      //   }
      // }),
      new TerserWebpackPlugin({
        exclude: /\.min\.js$/,
        cache: true,
        parallel: true, // 开启并行压缩，充分利用cpu
        extractComments: false, // 移除注释
        terserOptions: {
          output: {
            comments: false // 保留所有的注释
          },
          compress: {
            drop_debugger: true,
            // drop_console: true // 删除所有的 `console` 语句，可以兼容ie浏览器
          }
        }
      }),
      new OptimizeCSSPlugin({
        cssProcessorOptions: config.build.productionSourceMap
          ? { safe: true, map: { inline: false } }
          : { safe: true }
      })
    ],
    splitChunks: {
      chunks: 'async',
      minSize: 30000, // 最小大小，即当抽取的公共模块的大小，大于minSize所设置的值，才起作用
      minChunks: 1, // 最小块，即当块的数量大于等于minChunks时，才起作用
      maxAsyncRequests: 6, // 最大的异步请求数
      maxInitialRequests: 4, // 最大的初始请求数
      automaticNameDelimiter: '~', // 文件生成的链接符
      name: false,
      cacheGroups: {
        // 缓存组，抽取公共模块什么的，都在这个地方
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'initial',
          priority: 10 // 优先级，只配置在缓存组的每一项，决定执行的顺序。
        }
      }
    }
  }
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')
  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      test: new RegExp(
        '\\.(' + config.build.productionGzipExtensions.join('|') + ')$'
      ),
      threshold: 1024
    })
  )
}

if (process.argv[2] === 'show') {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
