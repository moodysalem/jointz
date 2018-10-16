const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts']
  },
  output: {
    filename: 'jointz.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'jointz',
    libraryExport: 'default',
    libraryTarget: 'umd'
  }
};