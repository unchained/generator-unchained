let webpack = require('webpack-stream');

var loaders = [
    {
        "test": /\.js?$/,
        "loader": "babel-loader",
        "query": {
            "presets": ["env"]
        }
    }
];

module.exports = function (options = {}) {
    options = {
        ...{
            environment: "development",
            analyze: false
        },
        ...options
    };

    return {
        output: {
            filename: "[name].js"
        },
        module: {
            loaders: loaders
        }
        ,
        plugins: [
            new webpack.webpack.ProvidePlugin({
                // $: 'jquery',
                // jQuery: 'jquery'
            }),
            new webpack.webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: webpack.webpack.devtool && (webpack.webpack.devtool.indexOf("sourcemap") >= 0 || webpack.webpack.devtool.indexOf("source-map") >= 0)
            }),
            new webpack.webpack.NamedModulesPlugin(),
            /**
             * This takes files which are required in at least 3 different files and places them into a common.js file
             */
            new webpack.webpack.optimize.CommonsChunkPlugin({
                names: ["commons"],
                minChunks: 3
            }),
            /**
             * plugins to be added when in analyze mode (`gulp --analyze`)
             */
            ...( options.analyze ? [
                new require('webpack-bundle-analyzer').BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: 'webpackReport.html',
            })] : []),
            /**
             * plugins to be added when in production only
             */
            ...(options.environment === "production"? [

            ]:[])
        ],
        devtool: options.environment === "development" ? 'cheap-module-eval-source-map' : "nosources-source-map"
    }
};