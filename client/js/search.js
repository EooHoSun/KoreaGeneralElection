import { debounce } from 'lodash'
import * as Hangul from 'hangul-js'
import { toggleSidebar } from './menu'

/**
 * Search 정의
 */
function Search(data) {
	this.els = {
		input: document.getElementById('v-search-input'),
		ul: document.getElementById('v-search-ul'),
		reset: document.getElementById('v-search-reset'),
	}
	this.data = data.features
	this.electCds = data.features.map(element => element.properties.elect_cd)

	this.init()
}

/**
 * Search UL을 리셋
 * @param {Node} el
 */
function resetUl(el) {
	// eslint-disable-next-line no-param-reassign
	el.innerHTML = ''
	el.classList.remove('show')
}

// init Search
Search.prototype.init = function() {
	// input 입력 이벤트 추가
	this.els.input.addEventListener(
		'keydown',
		debounce(e => {
			const inputValue = e.target.value.trim()
			const suggestions =
				inputValue === ''
					? []
					: this.electCds.filter(n => Hangul.search(n, inputValue) > -1)
			if (suggestions.length > 0) {
				// TODO: 종로구 (서울특별시) 이렇게 검색할 수 있을까?
				this.els.ul.classList.add('show')
				this.els.ul.innerHTML = suggestions
					.map(li => `<li class="v-search-li">${li}</li>`)
					.join('')
			} else {
				resetUl(this.els.ul)
			}
		}, 100)
	)

	// input focus 이벤트 추가
	this.els.input.addEventListener('focus', function() {
		this.parentNode.classList.add('focused')
	})
	this.els.input.addEventListener('blur', function() {
		this.parentNode.classList.remove('focused')
	})

	// input reset 이벤트 추가
	this.els.reset.addEventListener('click', () => {
		this.els.input.value = ''
		resetUl(this.els.ul)
	})
}

/**
 * eventName에 따라 callback을 실행시킨다
 */
Search.prototype.bindEvent = function(eventName, callback) {
	// 검색결과 클릭시 이벤트
	if (eventName === 'selectGeoJson') {
		this.els.ul.addEventListener('click', e => {
			if (!e.target.className === 'v-search-li') return

			const filtered = this.data.find(
				feature => feature.properties.elect_cd === e.target.textContent
			)
			// 선택값이 존재하면 callback 실행
			if (filtered && callback) {
				callback(filtered)
			}

			// ul 값 지움 & 메뉴 닫기
			resetUl(this.els.ul)
			toggleSidebar()
		})
	}
}

export default Search
