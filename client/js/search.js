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
	this.electCds = data.features.map(element => {
		const electCd = element.properties.elect_cd
		const electArr = electCd.split('|')
		const disassembled = Hangul.disassemble(`${electArr[1]}${electArr[0]}`, true).reduce(
			(acc, curr) => acc + curr[0],
			''
		)
		return {
			text: `${electArr[1]}(${electArr[0]})`,
			value: electCd,
			disassembled, // 초성검색용 초성
		}
	})

	this.init()
}

/**
 * call로 받아서 element를 리셋
 */
function resetEl() {
	// this: searchObj.els.ul
	this.innerHTML = ''
	this.classList.remove('show')
}

/**
 * call로 받아서 UL을 만든다
 * @param {Event} e
 */
function buildUl(e) {
	const inputValue = e.target.value.trim()
	if (!inputValue) {
		resetEl.call(this.els.ul)
		return
	}

	const isConsonant = Hangul.isConsonant(inputValue) // 인풋이 초성인가
	// 초성을 반환 ex) 한글날 -> ㅎㄱㄴ
	const disassembled = Hangul.disassemble(inputValue, true).reduce(
		(acc, curr) => acc + curr[0],
		''
	)

	// 초성이면 초성검색, 그 외는 일반검색
	const suggestions = this.electCds.filter(n =>
		isConsonant ? n.disassembled.includes(disassembled) : n.value.includes(inputValue)
	)
	if (suggestions.length > 0) {
		this.els.ul.classList.add('show')
		this.els.ul.innerHTML = suggestions
			.map(li => `<li class="v-search-li" data-cd="${li.value}">${li.text}</li>`)
			.join('')
	} else {
		resetEl.call(this.els.ul)
	}
}

// init Search
Search.prototype.init = function() {
	// input 입력 이벤트 추가
	this.els.input.addEventListener(
		'keydown',
		debounce(e => buildUl.call(this, e), 100)
	)

	// input focus / blur 이벤트 추가
	this.els.input.addEventListener('focus', e => {
		this.els.input.parentNode.classList.add('focused')
		buildUl.call(this, e)
		// 클릭시 ul 닫는 이벤트 활성화
		setTimeout(() => {
			document.addEventListener('click', () => resetEl.call(this.els.ul), { once: true }) // 한번만 실행하고 이 listener 삭제
		}, 200)
	})
	this.els.input.addEventListener('blur', function() {
		this.parentNode.classList.remove('focused')
	})

	// input reset 이벤트 추가
	this.els.reset.addEventListener('click', () => {
		this.els.input.value = ''
		resetEl.call(this.els.ul)
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
				feature => feature.properties.elect_cd === e.target.dataset.cd
			)
			// 선택값이 존재하면 callback 실행
			if (filtered && callback) {
				callback(filtered)
			}

			// 메뉴 닫기
			toggleSidebar()
		})
	}
}

export default Search
