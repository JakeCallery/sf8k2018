'use strict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
//const WebpackAutoInject = require('./forWebPack/webpack-auto-inject-version');
const ImageminPlugin = require('imagemin-webpack-plugin').default;

console.log('DIRNAME: ' + __dirname);
const distDir = 'dist';
const distDirPath = __dirname + '/../' + distDir;

module.exports = {
    entry: {
        indexEntry:'./js/index.js'
    },

    output: {
        filename: '[name].js',
        path: distDirPath,
        publicPath: ''
    },

    resolve: {
        modules: [
            'node_modules',
            './js',
            './js/jac'
        ]
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: false,
                            sourceMap: false
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },

    plugins: [
        // new CleanWebpackPlugin([distDir], {
        //     root: distDirRoot,
        //     verbose: true,
        //     dry: false,
        //     exclude: []
        // }),

        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'html/index.html',
            hash: true,
            chunks: [
                'indexEntry'
            ]
        }),

        // new WebpackAutoInject({
        //     autoIncrease: true,
        //     injectByTag: true,
        //     injectAsComment: true
        // }),

        function() {
            this.plugin('watch-run', function(watching, callback) {
                console.log('Begin Compile At ' + new Date());
                callback();
            })
        }
    ],
    devtool: 'source-map'
};