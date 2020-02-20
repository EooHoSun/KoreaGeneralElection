import axios from 'axios'

/**
 * electInfo 정의
 *
 *
 */
function ElectInfo() {}

// 후보자 선거공약 정보 조회
// @Param 후보자ID
ElectInfo.prototype.getCandPromise = function() {
	const xhr = new XMLHttpRequest()
	const url =
		'http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire' /* URL */
	let queryParams =
		`?${encodeURIComponent('ServiceKey')}=` +
		`fdAVKmTWvb4BL9fpuPUn%2BcKBo%2BgFfqhai4FaWaaLhqRnxAOr23KFMsnMfGAFpilBD0uLeEGL8As96NS0uNQd7g%3D%3D` /* Service Key */
	queryParams += `&${encodeURIComponent('ServiceKey')}=${encodeURIComponent(
		'fdAVKmTWvb4BL9fpuPUn%2BcKBo%2BgFfqhai4FaWaaLhqRnxAOr23KFMsnMfGAFpilBD0uLeEGL8As96NS0uNQd7g%3D%3D'
	)}` /* 공공데이터포털에서 받은 인증키 */
	queryParams += `&${encodeURIComponent('pageNo')}=${encodeURIComponent('1')}` /* 페이지번호 */
	queryParams += `&${encodeURIComponent('numOfRows')}=${encodeURIComponent('10')}` /* 목록 건수 */
	queryParams += `&${encodeURIComponent('sgId')}=${encodeURIComponent('20170509')}` /* 선거ID */
	queryParams += `&${encodeURIComponent('sgTypecode')}=${encodeURIComponent(
		'1'
	)}` /* 선거종류코드 */
	queryParams += `&${encodeURIComponent('cnddtId')}=${encodeURIComponent(
		'1000000000'
	)}` /* 후보자ID */
	xhr.open('GET', url + queryParams)
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			alert(
				`Status: ${this.status} Headers: ${JSON.stringify(
					this.getAllResponseHeaders()
				)} Body: ${this.responseText}`
			)
			console.log(this.responseText)
		}
	}

	xhr.send('')
}

ElectInfo.prototype.getCodeInfo = function() {
	const xhr = new XMLHttpRequest()
	const url =
		'http://apis.data.go.kr/9760000/CommonCodeService/getCommonEduBckgrdCodeList' /* URL */
	let queryParams = `?${encodeURIComponent('ServiceKey')}=${encodeURIComponent(
		'fdAVKmTWvb4BL9fpuPUn%2BcKBo%2BgFfqhai4FaWaaLhqRnxAOr23KFMsnMfGAFpilBD0uLeEGL8As96NS0uNQd7g%3D%3D'
	)}` /* 공공데이터포털에서 받은 인증키 */
	queryParams += `&${encodeURIComponent('pageNo')}=${encodeURIComponent('1')}` /* 페이지번호 */
	queryParams += `&${encodeURIComponent('numOfRows')}=${encodeURIComponent(
		'10'
	)}` /* 한 페이지 결과 수 */
	queryParams += `&${encodeURIComponent('sgId')}=${encodeURIComponent('20200415')}` /* 선거ID */
	xhr.open('GET', url + queryParams)
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			alert(
				`Status: ${this.status} Headers: ${JSON.stringify(
					this.getAllResponseHeaders()
				)} Body: ${this.responseText}`
			)
			console.log(this.responseText)
		}
	}

	xhr.send('')
}

export default ElectInfo
