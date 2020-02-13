import autocomplete from '@tarekraafat/autocomplete.js'

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
	autocomplete({
		data: {
			// Data src [Array, Function, Async] | (REQUIRED)
			src: data,
			cache: false,
		},
		query: {
			// Query Interceptor               | (Optional)
			manipulate: query => {
				return query.replace('pizza', 'burger')
			},
		},
		sort: (a, b) => {
			// Sort rendered results ascendingly | (Optional)
			if (a.match < b.match) return -1
			if (a.match > b.match) return 1
			return 0
		},
		placeHolder: 'Food & Drinks...', // Place Holder text                 | (Optional)
		selector: '#autoComplete', // Input field selector              | (Optional)
		threshold: 3, // Min. Chars length to start Engine | (Optional)
		debounce: 300, // Post duration for engine to start | (Optional)
		searchEngine: 'strict', // Search Engine type/mode           | (Optional)
		resultsList: {
			// Rendered results list object      | (Optional)
			render: true,
			container: source => {
				source.setAttribute('id', 'food_list')
			},
			destination: document.querySelector('#autoComplete'),
			position: 'afterend',
			element: 'ul',
		},
		maxResults: 5, // Max. number of rendered results | (Optional)
		highlight: true, // Highlight matching results      | (Optional)
		resultItem: {
			// Rendered result item            | (Optional)
			content: (data, source) => {
				
			},
			element: 'li',
		},
		noResults: () => {
			// Action script on noResults      | (Optional)
			const result = document.createElement('li')
			result.setAttribute('class', 'no_result')
			result.setAttribute('tabindex', '1')
			result.innerHTML = 'No Results'
			document.querySelector('#autoComplete_list').appendChild(result)
		},
		onSelection: feedback => {
			// Action script onSelection event | (Optional)
			console.log(feedback.selection.value.image_url)
		},
	})
}

export default Search2
