import * as path from 'path';


module.exports = {
    entry: {
        base: './public/javascripts/base.js',
        chat: './public/javascripts/chat.js',
        index: './public/javascripts/index.js',
        invate: './public/javascripts/invate.js',
        personal: './public/javascripts/personal.js',
        teamscreate: './public/javascripts/teamscreate.js'
    },
    output: {
        path: path.resolve(__dirname, './public/dist/'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /js$/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};

