import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet-search'


/**
 * Search 정의
 *
 */
function Search(data) {
	return this.init(data)
}

Search.prototype.init = function(data) {
	return new L.Control.Search({
		position: 'topleft',
		layer: data,
		marker: false,
		propertyName: 'elect_cd',
	})
}
export default Search
