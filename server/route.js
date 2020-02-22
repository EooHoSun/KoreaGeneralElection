const express = require('express')
const axios = require('axios')

const router = express.Router()

const hjdElect20_5 = require('./data/hjd_elect_20_5.json') // simplify 5%
const elected20 = require('./data/elected_20.json')
// const allElectRegPreCandidates = require('./data/candidate_20200220_02_30_ver2.json')
const allElectRegPreCandidates = require('./data/cadidate_20200221_16_30.json')

/**
 * /api/data
 * 기본 데이터
 */
router.get('/data', (req, res) => {
	res.json({
		geoJson: hjdElect20_5,
		elected: elected20,
	})
})

/**
 * /api/preCand
 */
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

/**
 * /api/criminalPdf
 * 선관위 pdf stream을 반환
 *
 * @param {String} huboId
 */
router.get('/criminalPdf', async (req, res) => {
	const { huboId, stream } = req.query

	// pdf 주소 가져오기
	const res1 = await axios.get(
		'http://info.nec.go.kr/electioninfo/candidate_detail_scanSearchJson.json',
		{
			params: {
				gubun: '5',
				electionId: '0020200415',
				huboId,
				statementId: 'PCRI03_candidate_scanSearch',
			},
		}
	)
	let pdfPath = 'http://info.nec.go.kr/unielec_pdf_file/'
	pdfPath += res1.data.jsonResult.body[0].FILEPATH.replace('tif', 'PDF')

	// 스트림이 아니라면 pdf 주소 전달
	if (!stream) {
		res.json({
			url: pdfPath,
		})
	} else {
		// pdf stream 가져오기
		const { data } = await axios.get(pdfPath, {
			responseType: 'stream',
			headers: {
				Accept: 'application/pdf',
			},
		})
		res.header('Content-Type', 'application/pdf')
		data.pipe(res)
	}
})

module.exports = router
