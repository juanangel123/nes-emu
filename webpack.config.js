const path = require('path');

module.exports = {
    entry: ['@babel/polyfill', './src/index.js'],
    devServer: {
        host: '0.0.0.0',
        port: 8081
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    plugins: [
                        '@babel/plugin-proposal-class-properties'
                    ]
                }
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
};
