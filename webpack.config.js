const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = function(env) {
	const isProd = env === 'production'
	const entryPoints = ['index'] // entry

	return {
		mode: isProd ? 'production' : 'development',
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
							use: 'babel-loader',
						},
						{
							test: /\.css$/,
							use: [
								isProd && { loader: MiniCssExtractPlugin.loader },
								!isProd && 'style-loader',
								'css-loader',
							].filter(Boolean),
						},
						{
							test: /\.html$/i,
							loader: 'html-loader',
						},
						{
							exclude: [/\.js$/, /\.html$/, /\.json$/],
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
		},
		devServer: {
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
