import accessibleAutocomplete from 'accessible-autocomplete'

/**
 * Search 정의
 *
 */
function Search2(data) {
	this.input = {}
	this.data = {}
	return this.init(data)
}
Search2.prototype.init = function(data) {
	this.data = data
	accessibleAutocomplete({
		element: document.querySelector('#v-search-input'),
		id: 'my-autocomplete', // To match it to the existing <label>.
		source: data,
	})
}

export default Search2
