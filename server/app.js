const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const isProd = process.env.NODE_ENV === 'production'

const app = express()

app.use(bodyParser.json())
app.use(
	bodyParser.urlencoded({
		extended: false,
	})
)

if (!isProd) {
	app.use(cors())
}

app.use('/api', require('./route'))

if (isProd) {
	app.use('/', express.static(path.resolve(__dirname, 'public')))
}

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	res.render('error', { error: err })
})

const port = 8090
app.listen(port, () => console.log(`listening on port ${port} : http://localhost:${port}`))
