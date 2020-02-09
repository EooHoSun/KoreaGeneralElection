import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import axios from 'axios'
import 'leaflet-control-custom/Leaflet.Control.Custom'
import markerIcon from '../img/marker.png'

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
	this.overlayLayers = {}
}

/**
 * init map
 */
VoteMap.prototype.init = async function init() {
	const self = this
	const zoom = 7 // init zoom
	const center = L.latLng(36.1358642, 128.0785804) // init center

	// Google Map
	const googleMap = L.tileLayer('https://mt0.google.com/vt/lyrs=m&hl=kr&x={x}&y={y}&z={z}', {
		attribution: `&copy; <a target="_blank" href="https://maps.google.com/maps?ll=${center.lat},${center.lng}&amp;z=13&amp;t=m&amp;hl=ko-KR&amp;gl=US&amp;mapclient=apiv3" title="Google 지도에서 이 지역을 보려면 클릭하세요." ><img alt="" src="https://maps.gstatic.com/mapfiles/api-3/images/google4.png" draggable="false"></a>`,
	})

	this.map = L.map(this.mapId, {
		center,
		zoom,
		minZoom: 6,
		layers: googleMap,
	})

	const locIcon = L.icon({
		iconUrl: markerIcon,
		iconSize: [30, 30], // size of the icon
		iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
	})

	// Client's Now Location
	L.control
		.custom({
			position: 'topleft',
			content: '<button type="button" class="v-now-loc"></button>',
			classes: 'outer-btn',
			style: {
				margin: '10px',
				padding: '0px 0 0 0',
				cursor: 'pointer',
			},
			events: {
				click(data) {
					console.log(data)
					// 현재위치 표시X
					if (
						!self.overlayLayers.myloc ||
						Object.keys(self.overlayLayers.myloc).length === 0
					) {
						// Geolocation 객체를 사용
						if (navigator.geolocation) {
							const options = {
								enableHighAccuracy: true, // 정확한 값 : true, 대략적인 값 : false
								timeout: 10000, // 10 초이상 기다리지 않음.
							}

							navigator.geolocation.getCurrentPosition(
								function(position) {
									self.overlayLayers.myloc = L.marker(
										[position.coords.latitude, position.coords.longitude],
										{ icon: locIcon }
									)
									self.overlayLayers.myloc.addTo(self.map)
								},
								function(error) {
									// 위치를 가져오는데 실패한 경우
									console.log(error.message)
								},
								options
							)
						} else {
							alert('위치 기반 서비스를 지원하지 않는 브라우저 입니다.')
						}
					} else {
						self.map.removeLayer(self.overlayLayers.myloc)
						self.overlayLayers.myloc = {}
					}
				},
			},
		})
		.addTo(this.map)

	await this._makeGovLayer()

	return this.map
}

VoteMap.prototype._makeGovLayer = async function _makeGovLayer() {
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
			{ opacity: 1, className: 'elected-tooltip' }
		)
		.addTo(this.map)
}

export default VoteMap
