import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet-search'

/**
 * Search 정의
 *
 */
function Search(data) {
	this.popupDiv = {}
	return this.init(data)
}

Search.prototype.init = function(data) {
	return new L.Control.Search({
		position: 'topleft',
		layer: data,
		initial: false,
		marker: false,
		propertyName: 'elect_cd',
		moveToLocation(latlng, _title, map) {
			const zoom = map.getBoundsZoom(latlng.layer.getBounds())
			map.setView(latlng, zoom)
		},
	})
		.on('search:locationfound', function(e) {
			console.log(e)
			e.target.showAlert(e.layer)
		})
		.on('search:collapsed', function(e) {
			console.log(e)
		})
}
export default Search
