function menuClose() {
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
	// 메뉴 토글 클릭 이벤트
	document.getElementById('v-menu-toggle').addEventListener('click', function() {
		infoClose()
		document.querySelector('#menu').classList.add('open')
		document.querySelector('.page_cover').classList.add('open')
		document.querySelector('html').classList.add('open')
	})

	// 메뉴 닫기 클릭 이벤트
	document.getElementById('menu-close').addEventListener('click', menuClose)
	document.getElementById('page-cover').addEventListener('click', menuClose)

	// 20대 총선 결과
	document.getElementById('getLast').addEventListener('click', function() {
		menuClose()
		infoOpen()

		const lastElectionResultInfoTable = document.getElementsByClassName('v-last-party-info')[0]
		lastElectionResultInfoTable.style.display = 'inline-block'
	})

	// 정보 조회 닫기 버튼
	document.getElementById('infoClose').addEventListener('click', infoClose)
}

export default menu
