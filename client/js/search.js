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
		initial: false,
		marker: false,
		propertyName: 'elect_cd',
		moveToLocation(latlng, _title, map) {
			const zoom = map.getBoundsZoom(latlng.layer.getBounds())
			map.setView(latlng, zoom)
		},
		filterData(text, records) {
			// eslint-disable-next-line no-param-reassign
			text = text.replace(/[.*+?^${}()|[\]\\]/g, '')
			if (text === '') return []
			const regSearch = new RegExp(`^${text}`)
			const frecords = {}
			// eslint-disable-next-line no-restricted-syntax
			for (const key in records) {
				if (regSearch.test(key)) frecords[key] = records[key]
			}
			return frecords
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
