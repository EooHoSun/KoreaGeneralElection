/**
 * Search 정의
 *
 */
function Search2(data) {
	this.elements = {
		input: document.querySelector('#v-search-input'),
		ul: document.querySelector('#v-search-ul'),
	}
	this.data = data
	this.texts = data.features.map(element => element.properties.elect_cd)
	this.init()
}
Search2.prototype.init = function() {
	const self = this

	this.elements.input.onkeyup = function(e) {
		const text = e.target.value.trim().toLowerCase()
		let suggestions
		if (text === '') suggestions = []
		else suggestions = self.texts.filter(n => n.toLowerCase().indexOf(text) > -1)
		self.setLi(suggestions)
	}
}

Search2.prototype.setLi = function(list) {
	let html = ''
	// eslint-disable-next-line array-callback-return
	list.map(function(text) {
		html += `<li class="v-search-li">${text}</li>`
	})
	this.elements.ul.innerHTML = html
}

Search2.prototype.bindEvent = function(eventName, event) {
	const self = this

	if (eventName === 'selectGeoJson') {
		this.elements.ul.onclick = function(e) {
			if (!e.target.className === 'v-search-li') return
			event(
				self.data.features.filter(
					element => element.properties.elect_cd === e.target.textContent
				)[0]
			)
		}
	}
}
export default Search2
