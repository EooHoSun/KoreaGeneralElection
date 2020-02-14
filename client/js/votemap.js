import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import * as L from 'leaflet'
import 'leaflet-control-custom/Leaflet.Control.Custom'
import Search2 from './search2'
import { createElementFromHTML } from './util'

/**
 * 정당 & 레이어 색상
 */
const PARTY_COLOR = [
	{ party: '더불어민주당', color: '#1870B9' },
	{ party: '새누리당', color: '#C9151E' },
	{ party: '국민의당', color: '#006542' },
	{ party: '무소속', color: '#555555' },
	{ party: '정의당', color: '#FFCC00' },
	{ party: '', color: '#cccccc' }, // 파주
]

/**
 * VoteMap 정의
 *
 * @param {String} mapId
 */
function VoteMap(mapId) {
	this.mapId = mapId

	this.map = null
	this.layers = {}
	this.markers = {}
	this.controls = {}
	this.data = null

	this.init()
}

/**
 * init VoteMap
 */
VoteMap.prototype.init = async function init() {
	const { data } = await axios.get('/api/data?type=20')
	this.data = data

	const zoom = 7 // init zoom
	const center = L.latLng(36.1358642, 128.0785804) // init center

	// Google Map
	const googleMap = L.tileLayer('https://mt0.google.com/vt/lyrs=m&hl=kr&x={x}&y={y}&z={z}', {
		attribution: `&copy; <a target="_blank" href="https://maps.google.com/maps?ll=${center.lat},${center.lng}&amp;z=13&amp;t=m&amp;hl=ko-KR&amp;gl=US&amp;mapclient=apiv3" title="Google 지도에서 이 지역을 보려면 클릭하세요." ><img alt="" src="https://maps.gstatic.com/mapfiles/api-3/images/google4.png" draggable="false"></a>`,
	})

	// leaflet map 생성
	this.map = L.map(this.mapId, {
		center,
		zoom,
		minZoom: 6,
		layers: googleMap,
		maxBounds: [
			[31.947632, 123.764743],
			[38.814133, 132.180872],
		],
	})

	// 내위치찾기 버튼 생성
	this._createGeolocButton()

	// 21대 총선 선거구 그리기
	this._drawElectRegLayer()
	this.layers.electReg.addTo(this.map) // default
	// 20대 총선 결과 & 선거구 그리기
	this._drawElect20Layer()

	// search box 만들기
	this._setSearch()

	return this.map
}

// 메뉴 별 layer Change
VoteMap.prototype.changeLayer = function(layer, menuName) {
	// 선택한 레이어 올리기 (없을 경우만)
	if (!this.map.hasLayer(layer)) {
		layer.addTo(this.map)
	}
	// 그 외 레이어 지우기 (있을 경우만)
	Object.values(this.layers)
		.filter(l => l !== layer)
		.forEach(l => {
			if (this.map.hasLayer(l)) {
				l.removeFrom(this.map)
			}
		})

	if (menuName === 'elect20') {
		document.getElementById('v-pre').style.display = 'none'
		document.getElementById('v-last-result').style.display = 'block'
	} else if (menuName === 'electReg') {
		document.getElementById('v-last-result').style.display = 'none'
	}
}

/**
 * 내위치찾기 버튼 생성
 */
VoteMap.prototype._createGeolocButton = function() {
	const self = this

	const locIcon = L.divIcon({
		html: '<i class="fas fa-map-marker-alt fa-3x"></i>',
		iconSize: [27, 36],
		iconAnchor: L.point(13.5, 36),
		className: '',
	})

	// Client's Now Location
	L.control
		.custom({
			position: 'topleft',
			content: '<button class="v-now-loc"><i class="fas fa-map-marker-alt"></i></button>',
			events: {
				click() {
					if (self.markers.myloc) {
						self.map.removeLayer(self.markers.myloc)
						delete self.markers.myloc
						return
					}

					if (!navigator.geolocation) {
						alert('위치 기반 서비스를 지원하지 않는 브라우저 입니다.')
						return
					}

					// Geolocation 객체를 사용
					navigator.geolocation.getCurrentPosition(
						position => {
							self.markers.myloc = L.marker(
								[position.coords.latitude, position.coords.longitude],
								{ icon: locIcon }
							)
							self.markers.myloc.addTo(self.map)
							self.map.setView([position.coords.latitude, position.coords.longitude])
						},
						error => {
							// 위치를 가져오는데 실패한 경우
							console.log(error.message)
						},
						{
							enableHighAccuracy: true, // 정확한 값 : true, 대략적인 값 : false
							timeout: 10000, // 10 초이상 기다리지 않음.
						}
					)
				},
			},
		})
		.addTo(this.map)
}

/**
 * 21대 총선 선거구 그리기
 */
VoteMap.prototype._drawElectRegLayer = function() {
	const self = this

	this.layers.electReg = L.geoJSON(this.data.geoJson, {
		style: {
			weight: 1,
			color: '#892da7',
			fillOpacity: 0.1,
			className: 'data-layer',
		},
		onEachFeature(feature, layer) {
			// bind click
			layer.on('click', () => {
				document.getElementById('v-pre').style.display = 'block'
				self._makePreCandidateInfo(feature.properties.elect_cd)
			})
		},
	}).bindTooltip(
		layer => {
			const elected = this.data.elected.find(
				x => x.elect_cd === layer.feature.properties.elect_cd
			)
			if (!elected) return '<strong>선거구 없음</strong>'
			return (
				`<p><strong>선거구 : </strong>${elected.sungugu}</p>` +
				'<p><small>클릭하면 예비후보자 조회가 가능합니다</small></p>'
			)
		},
		{ opacity: 1, className: 'v-elected-tooltip' }
	)
}

/**
 * 21대 총선 예비후보자 정보 출력
 */
VoteMap.prototype._makePreCandidateInfo = async function(electCd) {
	const { data } = await axios.get(`/api/preCand?electCd=${electCd}`)
	const { candidates } = data
	console.log(candidates)

	// 기존 table contents 삭제
	if (document.getElementsByClassName('v-pre-reg')[0].innerText !== '') {
		document.getElementsByClassName('v-pre-reg')[0].innerText = ''
		document.getElementsByClassName('v-pre-tbl')[1].remove() // table contents 지움
	}

	document.getElementsByClassName(
		'v-pre-reg'
	)[0].innerText = `${candidates[0].선거구명}  (2020.02.12.23:00기준)`

	// table contents
	let html = '<table class="v-pre-tbl">'
	// html += '<thead>'
	// html += ' <tr>'
	// html += '  <td>소속정당</td>'
	// html += '  <td>성명</td>'
	// html += '  <td>성별</td>'
	// html += '  <td>나이</td>'
	// html += '  <td>주소</td>'
	// html += '  <td>직업</td>'
	// html += '  <td>학력</td>'
	// html += '  <td>경력</td>'
	// html += '  <td>전과기록</td>'
	// html += ' </tr>'
	// html += '</thead>'
	html += '<tbody>'

	for (let i = 0; i < candidates.length; i += 1) {
		let name = candidates[i].성명
		name = name.substr(0, name.indexOf('<br'))
		let addr = candidates[i].주소
		const addrArr = addr.split(' ')
		if (addrArr.length > 2) {
			addr = `${addrArr[0]} ${addrArr[1]} ${addrArr[2]}`
		}
		html += '<tr>'
		html += ` <td>${candidates[i].소속정당}</td>`
		html += ` <td>${name}</td>`
		html += ` <td>${candidates[i].성별}</td>`
		html += ` <td>${candidates[i].생년월일.substr(-4, 2)}</td>`
		html += ` <td>${addr}<button class="v-pre-unfold"></button></td>`
		// html += ` <td>${candidates[i].직업}</td>`
		// html += ` <td>${candidates[i].학력}</td>`
		// html += ` <td>${candidates[i].경력}</td>`
		// html += ` <td>${candidates[i].전과기록건수}</td>`
		html += '</tr>'
		html += '<tr class="v-pre-detail-info"><td colspan="5">'
		html += `직업 : ${candidates[i].직업}<br>`
		html += `학력 : ${candidates[i].학력}<br>`
		html += `경력 : ${candidates[i].경력}<br>`
		html += `전과기록건수 : ${candidates[i].전과기록건수}<br>`
		html += '</td></tr>'
	}
	html += '</tbody>'
	html += '</table>'

	const tableContents = createElementFromHTML(html)
	document.getElementsByClassName('v-pre-tbl-content')[0].append(tableContents)

	const acc = document.getElementsByClassName('v-pre-unfold')
	let i
	// for (i = 0; i < acc.length; i += 1) {
	// 	acc[i].addEventListener('click', self._openPreCandDetailInfo(acc[i]))
	// }
	for (i = 0; i < acc.length; i += 1) {
		acc[i].onclick = function() {
			console.log(this)
			this.classList.toggle('active')
			const panel = this.parentElement.parentElement.nextElementSibling
			if (panel.style.display === 'contents') {
				panel.style.display = 'none'
			} else {
				panel.style.display = 'contents'
			}
		}
	}
}

VoteMap.prototype._openPreCandDetailInfo = function(button) {
	button.classList.toggle('active')
	const detailInfo = button.parentElement.parentElement.nextElementSibling
	if (detailInfo.style.maxHeight) {
		detailInfo.style.maxHeight = null
	} else {
		detailInfo.style.maxHeight = `${detailInfo.scrollHeight}px`
	}
}

/**
 * 20대 선거구 & 결과 그리기
 */
VoteMap.prototype._drawElect20Layer = function() {
	const self = this

	this.layers.elect20 = L.geoJSON(self.data.geoJson, {
		style(feature) {
			const elected = self.data.elected.find(x => x.elect_cd === feature.properties.elect_cd)
			const party = elected ? elected.party : ''
			return {
				weight: 1,
				color: PARTY_COLOR.find(x => x.party === party).color,
				fillOpacity: 0.4,
				className: 'data-layer',
			}
		},
	}).bindTooltip(
		layer => {
			const elected = self.data.elected.find(
				x => x.elect_cd === layer.feature.properties.elect_cd
			)
			if (!elected) return '<strong>선거구 없음</strong>'
			return (
				// `<p><strong>행정동 : </strong>${layer.feature.properties.adm_nm}</p>` +
				`<p><strong>선거구 : </strong>${elected.sungugu}</p>` +
				`<p><strong>당선인 : </strong>${elected.name}</p>` +
				`<p><strong>당선당 : </strong>${elected.party}</p>`
			)
		},
		{ opacity: 1, className: 'v-elected-tooltip' }
	)
}

VoteMap.prototype._setSearch = function() {
	this._setSearchEvent(new Search2(this.data.geoJson))
}

VoteMap.prototype._setSearchEvent = function(search) {
	const self = this
	search.bindEvent('selectGeoJson', function(geoJson) {
		self.map.setView(
			L.geoJSON(geoJson)
				.getBounds()
				.getCenter(),
			12
		)
	})

	search.bindEvent('deleteInput')
}

export default VoteMap
