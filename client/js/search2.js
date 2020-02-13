import autocomplete from 'autocompleter'

/**
 * Search 정의
 *
 */
function Search2(data) {
	this.elements = {
		input: null,
		ul: null,
	}
	this.data = data
	this.texts = data.getLayers().map(element => element.feature.properties.elect_cd)
	this.init()
}
Search2.prototype.init = function() {
	const self = this
	this.elements.input = document.querySelector('#v-search-input')
	this.elements.ul = document.querySelector('#v-search-ul')
	autocomplete({
		input: this.elements.input,
		fetch(text, update) {
			text = text.toLowerCase()
			// you can also use AJAX requests instead of preloaded data
			const suggestions = self.texts.filter(n => n.toLowerCase().indexOf(text) > -1)
			self.setLi(suggestions)
		},
	})
}

Search2.prototype.setLi = function(list) {
	let html = ''
	// eslint-disable-next-line array-callback-return
	list.map(function(text) {
		html += '<li class="v-search-li">' + text + '</li>'
	})
	this.elements.ul.innerHTML = html
}

Search2.prototype.eventHandler = function(eventName, event) {
	const self = this

	if (eventName === 'selectGeoJson') {
		this.elements.ul.onclick = function(e) {
			if (!e.target.className === 'v-search-li') return
			event(
				self.data
					.getLayers()
					.filter(
						element => element.feature.properties.elect_cd === e.target.textContent
					)[0]
			)
		}
	}
}

Search2.prototype.bindEvent = function() {}
export default Search2
