const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')

const isProd = process.env.NODE_ENV === 'production'

const app = express()

app.use(bodyParser.json())
app.use(
	bodyParser.urlencoded({
		extended: false,
	})
)

app.use('/api', require('./route'))

if (isProd) {
	app.use('/', express.static(path.resolve(__dirname, 'public')))
}

// error handler
// eslint-disable-next-line no-unused-vars
app.use('/api', (err, req, res, next) => {
	// api 내에서의 오류 처리
	res.status(500).json({ error: err.message })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	// 그 외 오류 처리
	res.render('error', { error: err })
})

const port = 8090
app.listen(port, () => console.log(`listening on port ${port} : http://localhost:${port}`))
