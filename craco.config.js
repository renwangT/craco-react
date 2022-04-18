const { whenDev, whenProd } = require('@craco/craco');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const CracoLessPlugin = require('craco-less');
const WebpackBar = require("webpackbar");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const SimpleProgressWebpackPlugin = require( 'simple-progress-webpack-plugin' )
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const webpack = require('webpack')
const path = require("path")
const pathResolve = pathUrl => path.join(__dirname, pathUrl)
// 判断编译环境是否为生产
// const isBuildAnalyzer = process.env.BUILD_ANALYZER === 'true'
module.exports = {
  webpack: {
    alias: {
      '@': pathResolve('src'),
      // 此处是一个示例，实际可根据各自需求配置
    },
    plugins: [
      // webpack构建进度条
      new WebpackBar({
        profile: true
      }),
      new SimpleProgressWebpackPlugin(),
      // 时间转换工具采取day替换moment
      new AntdDayjsWebpackPlugin(),
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp(
            '\\.(' +
            ['js', 'css'].join('|') +
            ')$'
        ),
        threshold: 1024,
        minRatio: 0.8
      }),
      new UglifyJsPlugin({
        uglifyOptions: {
            compress: {
                warnings: false,
                drop_debugger: true,
                drop_console: true,
            },
        },
        sourceMap: false,
        parallel: true,
      }),
      ...whenDev(
        () => [
          new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /src/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd()
          }),
          // webpack-dev-server 强化插件
          // new DashboardPlugin(),
          // new webpack.HotModuleReplacementPlugin()
        ], []
      ),
      ...whenProd(
          () => [
          new BundleAnalyzerPlugin({
            analyzerMode: 'static', // html 文件方式输出编译分析
            openAnalyzer: false,
            reportFilename: path.resolve(__dirname, `analyzer/index.html`)
          })
        ], []
      ),
      new webpack.IgnorePlugin({
        contextRegExp: /^\.\/locale$/,
        resourceRegExp: /moment$/
      }),
    ],
     //抽离公用模块
     optimization: {
      splitChunks: {
          cacheGroups: {
              commons: {
                  chunks: 'initial',
                  minChunks: 2, maxInitialRequests: 5,
                  minSize: 0
              },
              vendor: {
                  test: /node_modules/,
                  chunks: 'initial',
                  name: 'vendor',
                  priority: 10,
                  enforce: true

              }
          }
      }
  }
  },
  babel: {
    plugins: [
      ['import', { libraryName: 'antd', style: true }],
    ]
  },
  plugins: [
    
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#ff6699' },
            javascriptEnabled: true,
          },
        },
      },
    },
    // {
    //   plugin: CracoVtkPlugin()
    // }
  ],
  devServer: {
    port: 9000,
    proxy: {
      '/api': {
        target: 'https://placeholder.com/',
        changeOrigin: true,
        secure: false,
        xfwd: false,
      }
    }
  },
};