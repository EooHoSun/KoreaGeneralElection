const express = require('express')
const axios = require('axios')

const router = express.Router()

// const hjdElect20_5 = require('./data/hjd_elect_20_5.json') // simplify 5%
// const elected20 = require('./data/elected_20.json')
// const allElectRegPreCandidates = require('./data/candidate_20200220_02_30_ver2.json')
// const allElectRegPreCandidates = require('./data/cadidate_20200221_16_30.json')

/**
 * /api/data
 * 기본 데이터
 */
router.get('/data', async (req, res) => {
	const { db } = req.app.locals
	// 20대 선거구별 행정동 geojson
	const hjd20 = await db
		.collection('hjd')
		.find({ 'properties.electionCode': '20160413' }, { projection: { _id: 0 } })
		.toArray()
	// 21대 선거구별 행정동 geojson
	const hjd21 = await db
		.collection('hjd')
		.find({ 'properties.electionCode': '20200415' }, { projection: { _id: 0 } })
		.toArray()
	// 20대 당선인
	const elected20 = await db
		.collection('elected')
		.find({ electionCode: '20160413' }, { projection: { _id: 0 } })
		.toArray()
	// 출력
	res.json({
		geoJson20: { type: 'FeatureCollection', features: hjd20 },
		geoJson21: { type: 'FeatureCollection', features: hjd21 },
		elected20,
	})
})

/**
 * /api/candidate
 * 21대 (예비)후보자 정보
 * @param {sggCode} String 선거구코드
 */
router.get('/candidate', async (req, res) => {
	const { db } = req.app.locals
	const { sggCode } = req.query

	// 21대 선거구코드, 데이터생성시간(버전고유코드) 별 (예비)후보자 목록
	const candidates = await db
		.collection('candidate')
		.find({ sggCode, created: '202002211630' }, { projection: { _id: 0 } })
		.toArray()

	// 출력
	res.json({
		candidates,
	})
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

<<<<<<< HEAD
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
=======
router.get('/preCand', (req, res) => {
	if (req.query.electCd === 'all') {
		res.json(allElectRegPreCandidates)
	} else {
		const sido = req.query.electCd.split('|')[0]
		const electReg = req.query.electCd.split('|')[1]

		if (allElectRegPreCandidates[sido][electReg]) {
			res.json({
				candidates: allElectRegPreCandidates[sido][electReg],
			})
		} else {
			res.json({})
		}
>>>>>>> 98d777b97054f6abc50b524e806cebe7191a9d75
	}
})

module.exports = router
