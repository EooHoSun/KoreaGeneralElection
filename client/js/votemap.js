import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { parse, format } from 'date-fns'
import UAParser from 'ua-parser-js'
import * as L from 'leaflet'
import 'leaflet-control-custom/Leaflet.Control.Custom'
import Search from './search'

/**
 * 정당 & 레이어 색상
 */
const PARTY_COLOR = [
	{ party: '더불어민주당', color: '#004EA2' },
	{ party: '새누리당', color: '#C9252B' },
	{ party: '국민의당', color: '#006241' },
	{ party: '무소속', color: '#555555' },
	{ party: '정의당', color: '#FFCC00' },
	{ party: '자유한국당', color: '#C9151E' },
	{ party: '미래한국당', color: '#C9151E' },
	{ party: '미래통합당', color: '#EF426F' },
	{ party: '바른미래당', color: '#00B4B4' },
	{ party: '대안신당', color: '#236736' },
	{ party: '우리공화당', color: '#14A83B' },
	{ party: '민중당', color: '#F16522' },
	{ party: '국가혁명배당금당', color: '#E7141A' },
	{ party: '새로운보수당', color: '#00A7E5' },
	{ party: '기본소득당', color: '#FE8871' },
	{ party: '민주평화당', color: '#43B02A' },
	{ party: '기독당', color: '#755191' },
	{ party: '대한당', color: '#4B3293' },
	{ party: '한나라당', color: '#D61921' },
	{ party: '국민새정당', color: '#1F6DDC' },
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
	this.floats = {
		elect20: {
			party: document.getElementById('v-last-party'),
		},
		electReg: {
			pre: document.getElementById('v-pre'),
		},
	}
	this.data = null

	this.init()
}

/**
 * init VoteMap
 */
VoteMap.prototype.init = async function init() {
	const { data } = await axios.get('/api/data')
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

	// 기본 이벤트 걸기
	this._addDefaultEvents()

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
VoteMap.prototype.changeLayer = function(layer) {
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
}

/**
 * 기본 이벤트 걸기
 */
VoteMap.prototype._addDefaultEvents = function() {
	// float box에 toggle 이벤트 추가
	document.querySelectorAll('.v-float-toggle').forEach(btn => {
		btn.addEventListener('click', function() {
			this.classList.toggle('hide')
			this.previousElementSibling.classList.toggle('hide')
		})
	})
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

							self.map.setView(
								[position.coords.latitude, position.coords.longitude],
								12
							)
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
 * 21대 총선 예비후보자 전과 기록 상세 조회
 *
 * @param {String} huboId
 */
async function getPreCandCriminalRecord(huboId) {
	const parser = new UAParser()
	const device = parser.getDevice().type
	const browser = parser.getBrowser().name
	if (browser.endsWith('Safari')) {
		// 사파리는 window.open 안 먹힘
		window.location.assign(`/api/criminalPdf?huboId=${huboId}&stream=true`)
	} else if (device === 'mobile' || device === 'tablet' || browser === 'IE') {
		const { data } = await axios.get(`/api/criminalPdf?huboId=${huboId}`)
		window.open(data.url, '_blank')
	} else {
		// 프록시 오픈
		window.open(`/api/criminalPdf?huboId=${huboId}&stream=true`, '_blank')
	}
}

/**
 * 21대 총선 예비후보자 정보 출력
 * * VoteMap의 prototype으로 지정할 필요 없을 것 같아서 따로 펑션으로 뺌
 *
 * @param {Node} preDiv 후보자 정보가 출력되는 node
 * @param {String} properties 선거구정보
 */
async function makePreCandidateInfo(preDiv, properties) {
	const {
		data: { candidates },
	} = await axios.get('/api/candidate', {
		params: { sggCode: properties.sggCode },
	})

	const toggleBtn = preDiv.querySelector('.v-float-toggle')
	const toggleBtnDiv = toggleBtn.querySelector('div')
	const tblContent = preDiv.querySelector('.v-pre-tbl-content')

	// 숨겨져 있을 수 있으므로 hide 지운다
	preDiv.children.forEach(node => node.classList.remove('hide'))

	// 토글버튼 내용 설정
	const parsedDate = parse(candidates[0].created, 'yyyyMMddHHmm', new Date())
	const formatted = format(parsedDate, 'yyyy.MM.dd.HH:mm')
	toggleBtnDiv.innerHTML = `<strong>${properties.sggName}</strong><br/><small>(${formatted}기준)</small>`

	// content table 작성
	let html = '<table class="v-pre-tbl"><tbody>'
	candidates.forEach(candi => {
		let { address } = candi
		const { name, party, criminal, huboId, gender, age, image, job, education, career } = candi
		const addrArr = address.split(' ')
		if (addrArr.length > 2) {
			address = `${addrArr[0]} ${addrArr[1]} ${addrArr[2]}`
		}
		const { color: partyColor } = PARTY_COLOR.find(x => x.party === party)
		const criminalClass = criminal === '없음' ? 'no-data' : 'has-data'
		html += '<tr>'
		html += `<td style="color:${partyColor}">${party}</td>`
		html += `<td><a href="https://search.naver.com/search.naver?query=${name}" target="_blank" title="네이버로 검색하기">${name}</a></td>`
		html += `<td>${gender}</td>`
		html += `<td>${age}</td>`
		html += `<td><span class="v-pre-criminal ${criminalClass}" data-hubo-id="${huboId}">${criminal}</span></td>`
		html += `<td><button class="v-pre-unfold"></button></td>`
		html += '</tr>'
		html += '<tr class="v-pre-detail-info">'
		html += '<td colspan="6">'
		html += '<div>'
		html += `<img src="${image}" />`
		html += '<div>'
		html += `<strong>직업 :</strong> ${job}<br />`
		html += `<strong>학력 :</strong> ${education}<br />`
		html += `<strong>경력 :</strong> ${career.join(', ')}<br />`
		html += `<strong>주소 :</strong> ${address}`
		html += '</div>'
		html += '</div>'
		html += '</td>'
		html += '</tr>'
	})
	html += '</tbody></table>'
	tblContent.innerHTML = html

	// 전과 기록 상세 조회 이벤트
	const criminalEl = tblContent.querySelectorAll('.v-pre-criminal')
	criminalEl.forEach(el => {
		el.addEventListener('click', function() {
			if (this.classList.contains('has-data')) {
				getPreCandCriminalRecord(this.dataset.huboId)
			}
		})
	})

	// 접기/펴기 액션 추가
	const foldBtns = tblContent.querySelectorAll('.v-pre-unfold')
	foldBtns.forEach(btn => {
		btn.addEventListener('click', function() {
			this.classList.toggle('show')
			this.parentNode.parentNode.nextElementSibling.classList.toggle('show')
		})
	})

	// pre div 안 보이면 켜기
	preDiv.classList.add('show')
}

/**
 * 21대 총선 선거구 그리기
 */
VoteMap.prototype._drawElectRegLayer = function() {
	let clicked = null // 직전 클릭된 레이어

	const preDiv = this.floats.electReg.pre
	this.layers.electReg = L.geoJSON(this.data.geoJson21, {
		style: {
			weight: 1,
			color: '#892da7',
			fillOpacity: 0.1,
			className: 'data-layer',
		},
		onEachFeature(feature, layer) {
			// bind click
			layer.on('click', () => {
				if (clicked === layer) return // 같은 경우는 냅둔다
				if (clicked) {
					Object.values(layer._eventParents)[0].fire('reset')
				}
				clicked = layer
				layer.setStyle({ fillOpacity: 0.9 })
				makePreCandidateInfo(preDiv, feature.properties)
			})
		},
	})
		.bindTooltip(
			layer => {
				const { sggName } = layer.feature.properties
				if (!sggName) return '<strong>선거구 없음</strong>'
				return (
					`<p><strong>선거구 : </strong>${sggName}</p>` +
					'<p><small>클릭하면 예비후보자 조회가 가능합니다</small></p>'
				)
			},
			{ opacity: 1, className: 'v-elect-tooltip v-elect-reg-tooltip' }
		)
		.on('remove', () => {
			// 21대 예비 후보자 정보 안보이게
			this.floats.electReg.pre.classList.remove('show')

			// 선택을 리셋
			this.layers.electReg.fire('reset')
		})
		.on('reset', function() {
			this.resetStyle()
		})
}

/**
 * 20대 선거구 & 결과 그리기
 */
VoteMap.prototype._drawElect20Layer = function() {
	const { geoJson20, elected20 } = this.data

	this.layers.elect20 = L.geoJSON(geoJson20, {
		style(feature) {
			const elected = elected20.find(x => x.sggCode === feature.properties.sggCode)
			const party = elected ? elected.party : ''
			return {
				weight: 1,
				color: PARTY_COLOR.find(x => x.party === party).color,
				fillOpacity: 0.4,
				className: 'data-layer',
			}
		},
	})
		.bindTooltip(
			layer => {
				const elected = elected20.find(x => x.sggCode === layer.feature.properties.sggCode)
				if (!elected) return '<strong>선거구 없음</strong>'
				return (
					`<p><strong>선거구 : </strong>${elected.sggName}</p>` +
					`<p><strong>당선인 : </strong>${elected.name}</p>` +
					`<p><strong>당선당 : </strong>${elected.party}</p>`
				)
			},
			{ opacity: 1, className: 'v-elect-tooltip' }
		)
		.on('add', () => {
			// 20대 총선 결과가 그려질때
			this.floats.elect20.party.classList.add('show')
			this.floats.elect20.party.children.forEach(node => node.classList.remove('hide'))
		})
		.on('remove', () => {
			// 20대 총선 결과 div를 숨김
			this.floats.elect20.party.classList.remove('show')
		})
}

/**
 * 후보자 검색
 */
VoteMap.prototype._setSearch = function() {
	// TODO: 21대 기준으로 만들었는데, 20대는?
	const search = new Search(this.data.geoJson21)

	// 검색결과 클릭시 이벤트 콜백으로 전달
	search.bindEvent('selectGeoJson', geoJson => {
		const { sggCode } = geoJson
		if (this.map.hasLayer(this.layers.electReg)) {
			// 21대 총선 정보 레이어가 on 상태라면
			const layers = this.layers.electReg.getLayers()
			const layer = layers.find(l => l.feature.properties.sggCode === sggCode)
			this.map.fitBounds(layer.getBounds())
			layer.fire('click')
		} else if (this.map.hasLayer(this.layers.elect20)) {
			// 20대 총선 결과 레이어가 on 상태라면
			const layers = this.layers.electReg.getLayers()
			const layer = layers.find(l => l.feature.properties.sggCode === sggCode)
			this.map.fitBounds(layer.getBounds())
			// TODO: 20대 총선 레이어에서 검색하면 어떻게 처리할 것인가?
		}
	})
}

export default VoteMap
