import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import 'leaflet-control-custom/Leaflet.Control.Custom'
import autocomplete from 'autocompleter'

function setUl_(arr) {
	if (arr.length === 0) return ''
	let ulInnerHtml = ''
	arr.forEach(element => {
		ulInnerHtml += `<li class="s-li" onclick="">${element}</li>`
	})
	return ulInnerHtml
}

/**
 * Search 정의
 *
 */
function Search(data) {
	this.data = data
	this.search = {}
	this.init()
}

Search.prototype.init = function() {
	this.search = L.control.custom({
		position: 'topleft',
		content:
			'<div class="input-group">' +
			'    <input type="text" id="s-input" class="s-input" placeholder="Search">' +
			'    <button class="s-button" type="button">Go!</button>' +
			'    <div class="s-ul-div">' +
			'        <ul id="s-ul" class="s-ul"></ul>' +
			'    </div>' +
			'</div>',
		classes: '',
		style: {
			position: 'absolute',
			left: '50px',
			top: '0px',
			width: '300px',
		},
		events: {
			click(e) {
			},
			change(e) {
			},
		},
	})
}

Search.prototype.setAutoComplete = function() {
	const self = this
	const input = document.getElementById('s-input')
	const ul = document.getElementById('s-ul')
	autocomplete({
		input,
		fetch: (text, update) => {
			// eslint-disable-next-line no-param-reassign
			text = text.toLowerCase()
			// eslint-disable-next-line prettier/prettier
			const suggestions = self.data.data.geoJson.features.filter(n =>
				n.properties.elect_cd.toLowerCase().indexOf(text) > -1
			)
			if (suggestions.length === 0) return
			// eslint-disable-next-line no-use-before-define
			ul.innerHTML = setUl_(
				suggestions.map(function(element) {
					return element.properties.elect_cd
				})
			)
			update(
				suggestions.map(function(element) {
					return element.properties.elect_cd
				})
			)
		},
		onSelect: item => {
			input.value = item.label
		},
	})
}


export default Search
