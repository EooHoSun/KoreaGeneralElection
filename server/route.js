const express = require('express')

const router = express.Router()

const hjdElect20_5 = require('./data/hjd_elect_20_5.json') // simplify 5%
const elected20 = require('./data/elected_20.json')

// /api/data
router.get('/data', (req, res) => {
	if (req.query.type === '20') {
		res.json({
			geoJson: hjdElect20_5,
			elected: elected20,
		})
	} else {
		res.json({})
	}
})

module.exports = router
