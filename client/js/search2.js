import axios from 'axios'
import * as Hangul from 'hangul-js'

const sToggleBtn = document.getElementById('v-sidebar-toggle')
function toggleSidebar() {
	sToggleBtn.classList.toggle('is-active')
	document.querySelectorAll('html, #v-sidebar, #v-page-cover').forEach(node => {
		node.classList.toggle('open')
	})
}

/**
 * Search 정의
 *
 */
function Search2(data) {
	this.elements = {
		input: document.querySelector('#v-search-input'),
		ul: document.querySelector('#v-search-ul'),
		span: document.querySelector('#v-search-span'),
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
		else suggestions = self.texts.filter(n => Hangul.search(n.toLowerCase(), text) > -1)
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
			const filteredElectCd = self.data.features.filter(
				element => element.properties.elect_cd === e.target.textContent
			)
			if (filteredElectCd.length !== 0) {
				event(filteredElectCd[0])
				self.getCandidateInfo(e.target.textContent)
			}

			// 클릭 시 input, ul 값 지움 & 메뉴 닫기
			self.elements.input.value = ''
			self.elements.ul.innerHTML = null
			toggleSidebar()
		}
	} else if (eventName === 'deleteInput') {
		this.elements.span.onclick = function() {
			self.elements.input.value = ''
			self.elements.ul.innerHTML = null
		}
	}
}

Search2.prototype.getCandidateInfo = async function(electCd) {
	const { data } = await axios.get(`/api/preCand?electCd=${electCd}`)
	console.log(data)
}
export default Search2
