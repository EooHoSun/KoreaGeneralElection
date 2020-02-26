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
	this.candidates = null
	this.texts = data.features.map(element => element.properties.elect_cd)
	this.init()
}
Search2.prototype.init = async function() {
	const self = this
	// const { data } = await axios.get(`/api/preCand?electCd=all`)
	// this.candidates = data

	this.elements.input.onkeyup = function(e) {
		const text = e.target.value.trim().toLowerCase()
		let areas
		if (text === '') {
			areas = []
			// candidates = []
		} else {
			areas = self.texts.filter(function(n) {
				return (
					Hangul.search(n.toLowerCase(), text) > -1 ||
					Hangul.disassemble(n, true)
						.map(function(s) {
							return s[0]
						})
						.join('')
						.indexOf(text) > -1
				)
			})
			// candidates = []
			// self.data.features.forEach(function(ee) {
			// 	const ss = ee.properties.elect_cd.split('-').join('')
			// 	if (ss.length === 1) return
			//     const split = ss.split('|')
			//     console.log(self.candidates[split[0]][split[1]])
			// 	candidates.concat(self.candidates[split[0]][split[1]])
			// })
			// console.log(candidates)
		}
		self.setLi(areas, '지역')
	}
}

Search2.prototype.setLi = function(list, kindList) {
	let html = ''
	// eslint-disable-next-line array-callback-return
	list.map(function(text) {
		html += `<li class="v-search-li" elect-cd="${text}">${text}<strong class="v-search-area">${kindList}</strong></li>`
	})
	this.elements.ul.innerHTML = html
}

Search2.prototype.bindEvent = function(eventName, event) {
	const self = this

	if (eventName === 'selectGeoJson') {
		this.elements.ul.onclick = function(e) {
			if (!e.target.className === 'v-search-li') return
			const electCd = e.target.getAttribute('elect-cd')
			const filteredElectCd = self.data.features.filter(
				element => element.properties.elect_cd === electCd
			)
			if (filteredElectCd.length !== 0) {
				event(filteredElectCd[0])
				self.getCandidateInfo(electCd)
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
	const { data } = await axios.get(`/api/preCand?electCd=all`)
	console.log(data)
}

export default Search2
