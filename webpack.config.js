const path = require('path');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const buildPath = './build/';

module.exports = {
    entry: ['./src/app.js'],
    output: {
        path: path.join(__dirname, buildPath),
        filename: '[name].[hash].js',
        publicPath: `/${pkg.repository}/`,
    },
    target: 'web',
    devtool: 'source-map',
    stats: {
        warnings: false,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: path.resolve(__dirname, './node_modules/'),
            },
            {
                test: /\.(jpe?g|png|gif|svg|tga|gltf|babylon|mtl|pcb|pcd|prwm|obj|mat|mp3|ogg|fbx)$/i,
                use: 'file-loader',
                exclude: path.resolve(__dirname, './node_modules/'),
            },
            {
                test: /\.(vert|frag|glsl|shader|txt)$/i,
                use: 'raw-loader',
                exclude: path.resolve(__dirname, './node_modules/'),
            },
        ],
    },
    resolve: {
        alias: {
            lights$: path.resolve(__dirname, 'src/components/lights'),
            crosshair$: path.resolve(__dirname, 'src/components/crosshair'),
            objects$: path.resolve(__dirname, 'src/components/objects'),
            scenes$: path.resolve(__dirname, 'src/components/scenes'),
            textures$: path.resolve(__dirname, 'assets/textures'),
            globals$: path.resolve(__dirname, 'src/globals'),
        },
    },
    plugins: [
        new HtmlWebpackPlugin({ title: pkg.title, favicon: 'src/favicon.ico' }),
    ],
};
