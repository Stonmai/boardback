const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        popup: './src/popup/index.tsx',
        background: './src/background/index.ts',
        content: './src/content/index.ts',
        newtab: './src/newtab/index.ts',
        options: './src/options/index.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/popup.html',
            filename: 'popup.html',
            chunks: ['popup'],
        }),
        new HtmlWebpackPlugin({
            template: './public/newtab.html',
            filename: 'newtab.html',
            chunks: ['newtab'],
        }),
        new HtmlWebpackPlugin({
            template: './public/options.html',
            filename: 'options.html',
            chunks: ['options'],
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public/manifest.json', to: 'manifest.json' },
                { from: 'public/icon.png', to: 'icon.png' },
            ],
        }),
    ],
};
