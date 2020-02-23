const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb')

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

// MongoDB 정의
const dbUser = process.env.DB_USER || ''
const dbPw = process.env.DB_PW || ''
const dbAuth = dbUser && dbPw ? `${dbUser}:${encodeURIComponent(dbPw)}@` : ''
const client = new MongoClient(`mongodb://${dbAuth}localhost:27017`, { useUnifiedTopology: true })
client.connect(err => {
	if (err) {
		console.error(err.stack)
		return
	}
	console.log('connected to mongodb')
	// 몽고디비를 app의 글로벌 변수로 연결
	const db = client.db('kge')
	app.locals.db = db

	// express app 8090 포트로 기동
	const port = 8090
	app.listen(port, () => console.log(`listening on port ${port} : http://localhost:${port}`))
})
