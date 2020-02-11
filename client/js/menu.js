function menuClose() {
	window.location.hash = ''
	document.querySelector('#menu').classList.remove('open')
	document.querySelector('.page_cover').classList.remove('open')
	document.querySelector('html').classList.remove('open')
}

function infoClose() {
	document.getElementById('v-info').style.display = 'none'
}

function infoOpen() {
	document.getElementById('v-info').style.display = 'block'
}

function menu() {
	document.getElementById('v-menu-toggle').addEventListener('click', function() {
		infoClose()
		document.querySelector('#menu').classList.add('open')
		document.querySelector('.page_cover').classList.add('open')
		document.querySelector('html').classList.add('open')
		window.location.hash = '#open'
	})

	window.onhashchange = function() {
		if (window.location.hash !== '#open') {
			document.querySelector('#menu').classList.remove('open')
			document.querySelector('.page_cover').classList.remove('open')
			document.querySelector('html').classList.remove('open')
		}
	}

	// 20대 총선 결과
	document.getElementById('getLast').addEventListener('click', function() {
		menuClose()
		infoOpen()

		const lastElectionResultInfoTable = document.getElementsByClassName('v-last-party-info')[0]
		console.log('click!!')
		lastElectionResultInfoTable.style.display = 'inline-block'
	})

	// 정보 조회 닫기 버튼
	document.getElementById('infoClose').addEventListener('click', infoClose)
}

export default menu
