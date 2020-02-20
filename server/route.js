const express = require('express')

const router = express.Router()

const hjdElect20_5 = require('./data/hjd_elect_20_5.json') // simplify 5%
const elected20 = require('./data/elected_20.json')
const allElectRegPreCandidates = require('./data/candidate_20200220_02_30_ver2.json')

// /api/data
router.get('/data', (req, res) => {
	res.json({
		geoJson: hjdElect20_5,
		elected: elected20,
	})
})

router.get('/preCand', (req, res) => {
	const sido = req.query.electCd.split('|')[0]
	const electReg = req.query.electCd.split('|')[1]

	if (allElectRegPreCandidates[sido][electReg]) {
		res.json({
			candidates: allElectRegPreCandidates[sido][electReg],
		})
	} else {
		res.json({})
	}
})

module.exports = router
