const path = require('path');
const package = require('./package.json');

module.exports = {
    mode: 'development',
    // エントリーポイントの設定
    entry: './src/js/app.js',
    module: {
        rules: [
            {
              test: /\.css/,
              use: [
                'style-loader',
                {loader: 'css-loader', options: {url: false, minimize: true}},
              ],
            },
            {
              test: /\.js$/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: [
                    ['@babel/preset-env', {
                      "targets": {
                        "browsers": ["ie 11"]
                      }
                    }]
                  ],
                  plugins: ["transform-object-assign"]
                }
              }
            }
          ]      
    },
    output: {
        filename: `${package.name}.js`,
        path: path.join(__dirname, 'dist')
    }
  };