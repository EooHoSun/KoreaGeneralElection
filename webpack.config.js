/* eslint-disable global-require */
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserJSPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const postcssNormalize = require('postcss-normalize')

module.exports = function(env) {
	const isProd = env === 'production'
	const entryPoints = ['index'] // entry

	const getStyleLoaders = preProcessor =>
		[
			!isProd && 'style-loader',
			isProd && { loader: MiniCssExtractPlugin.loader },
			{
				loader: 'css-loader',
				options: {
					importLoaders: preProcessor ? 3 : 1,
					sourceMap: isProd,
				},
			},
			{
				loader: 'postcss-loader',
				options: {
					ident: 'postcss',
					plugins: () => [
						require('postcss-flexbugs-fixes'),
						require('postcss-preset-env')({
							stage: 3,
						}),
						postcssNormalize(),
					],
					sourceMap: isProd,
				},
			},
			preProcessor && {
				loader: 'sass-loader',
				options: {
					sourceMap: true,
				},
			},
		].filter(Boolean)

	return {
		mode: isProd ? 'production' : 'development',
		devtool: isProd ? false : 'cheap-module-source-map',
		entry: entryPoints.reduce((acc, curr) => {
			acc[curr] = path.resolve(__dirname, `client/${curr}.js`)
			return acc
		}, {}),
		output: {
			path: isProd ? path.resolve(__dirname, 'server/public') : undefined,
			filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
			chunkFilename: isProd
				? 'static/js/[name].[contenthash:8].chunk.js'
				: 'static/js/[name].chunk.js',
			publicPath: '/',
		},
		module: {
			rules: [
				{
					oneOf: [
						{
							test: /\.js$/,
							exclude: /node_modules/,
							loader: 'babel-loader',
							options: {
								cacheDirectory: true,
								cacheCompression: false,
								sourceMaps: !isProd,
								inputSourceMap: !isProd,
							},
						},
						{
							test: /\.css$/,
							use: getStyleLoaders(false),
							sideEffects: true,
						},
						{
							test: /\.(scss|sass)$/,
							use: getStyleLoaders(true),
							sideEffects: true,
						},
						{
							test: /\.html$/i,
							loader: 'html-loader',
						},
						{
							test: [/\.(woff|woff2|ttf|eot)$/],
							loader: 'file-loader',
							options: {
								name: 'static/font/[name].[ext]',
								esModule: false,
							},
						},
						{
							exclude: [/\.js$/, /\.json$/],
							loader: 'file-loader',
							options: {
								name: 'static/media/[name].[hash:8].[ext]',
								esModule: false,
							},
						},
					],
				},
			],
		},
		plugins: [
			isProd && new CleanWebpackPlugin(),
			...entryPoints.map(
				entry =>
					new HtmlWebpackPlugin({
						favicon: path.resolve(__dirname, `client/favicon.ico`),
						template: path.resolve(__dirname, `client/${entry}.html`),
						filename: `${entry}.html`,
						chunks: [entry],
						...(isProd
							? {
									minify: {
										removeComments: true,
										collapseWhitespace: true,
										removeRedundantAttributes: true,
										useShortDoctype: true,
										removeEmptyAttributes: true,
										removeStyleLinkTypeAttributes: true,
										keepClosingSlash: true,
										minifyJS: true,
										minifyCSS: true,
										minifyURLs: true,
									},
							  }
							: undefined),
					})
			),
			isProd &&
				new MiniCssExtractPlugin({
					filename: 'static/css/[name].[contenthash:8].css',
					chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
				}),
		].filter(Boolean),
		optimization: {
			splitChunks: {
				chunks: 'all',
			},
			minimize: isProd,
			minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
		},
		devServer: {
			host: '0.0.0.0',
			port: 8080,
			useLocalIp: true,
			hot: true,
			open: true,
			proxy: {
				'/api': {
					target: 'http://localhost:8090',
				},
			},
			before(app, server) {
				server._watch('client/**/*.html')
			},
		},
	}
}
