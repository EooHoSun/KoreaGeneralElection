import 'leaflet-search/dist/leaflet-search.min.css' // css 우선 import
import * as L from 'leaflet'
import 'leaflet-search'

/**
 * Search 정의
 */
function Search(data) {
	return new L.Control.Search({
		position: 'topleft',
		layer: data,
		marker: false,
		propertyName: 'elect_cd',
		moveToLocation(latlng, _title, map) {
			const zoom = map.getBoundsZoom(latlng.layer.getBounds())
			map.setView(latlng, zoom)
		},
	})
		.on('search:locationfound', function(e) {
			console.log(e)
		})
		.on('search:collapsed', function(e) {
			console.log(e)
		})
}

export default Search
