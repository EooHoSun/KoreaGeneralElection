import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import axios from 'axios'
import 'leaflet-control-custom/Leaflet.Control.Custom'
import Search from './search'

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
	this.map = {}
	this.mapId = mapId
	this.markers = {}
	this.hjd = {}
}

/**
 * init VoteMap
 */
VoteMap.prototype.init = async function init() {
	const zoom = 7 // init zoom
	const center = L.latLng(36.1358642, 128.0785804) // init center

	this._setHJD()
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
	})

	// 내위치찾기 버튼 생성
	this._createGeolocButton()

	// 20대 선거구 그리기
	await this._drawElect20Layer()

	this._setSearch()

	return this.map
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
 * 20대 선거구 그리기
 */
VoteMap.prototype._drawElect20Layer = async function() {
	const { data } = await axios.get('/api/data?type=20')
	L.geoJSON(data.geoJson, {
		style(feature) {
			const elected = data.elected.find(x => x.elect_cd === feature.properties.elect_cd)
			const party = elected ? elected.party : ''
			return {
				weight: 1,
				color: PARTY_COLOR.find(x => x.party === party).color,
			}
		},
	})
		.bindTooltip(
			layer => {
				const elected = data.elected.find(
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
		.addTo(this.map)
}

/**
 * search box 만들기
 */
VoteMap.prototype._setSearch = async function() {
	this.map.addControl(new Search(this.hjd))
}

/**
 * 행정동 setting
 */
VoteMap.prototype._setHJD = async function() {
	const { data, status } = await axios.get('/api/data?type=20')
	if (status !== 200) return

	this.hjd = L.geoJSON(data.geoJson, {
		style: {
			weight: 1,
			color: '#00ff0000',
		},
	})
	this.hjd.addTo(this.map)
	console.log(this.hjd)
}

export default VoteMap
