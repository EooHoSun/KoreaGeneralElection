// const lastResultEl = document.getElementById('v-last-result')
// const preCandEl = document.getElementById('v-pre-cand')
const sToggleBtn = document.getElementById('v-sidebar-toggle')

function toggleSidebar() {
	sToggleBtn.classList.toggle('is-active')
	document.querySelectorAll('html, #v-sidebar, #v-page-cover').forEach(node => {
		node.classList.toggle('open')
	})
}

// function closeInfo() {
// 	lastResultEl.style.display = 'none'
// 	preCandEl.style.display = 'none'
// }c

// function openInfo() {
// 	lastResultEl.style.display = 'block'
// }

function menu({ mapObj }) {
	// 사이드바 토글 클릭 이벤트
	sToggleBtn.addEventListener('click', toggleSidebar)

	// cover 클릭시에도 사이드바 닫기
	document.getElementById('v-page-cover').addEventListener('click', toggleSidebar)

	// 메뉴1: 21대 총선 정보 선택
	document.getElementById('get-electReg-btn').addEventListener('click', function() {
		// closeInfo() // TODO: 레이어 의존으로 변경
		toggleSidebar()
		mapObj.changeLayer(mapObj.layers.electReg, 'electReg')
	})

	// 메뉴2: 20대 총선 결과 선택
	document.getElementById('get-elect20-btn').addEventListener('click', function() {
		// openInfo() // TODO: 레이어 의존으로 변경
		toggleSidebar()
		mapObj.changeLayer(mapObj.layers.elect20, 'elect20')
	})

	// TODO: 레이어 의존으로 변경
	// 정보 조회 닫기 버튼
	// document.getElementById('v-last-result-close').addEventListener('click', closeInfo)

	// // 정보 조회 닫기 버튼
	// document.getElementById('v-pre-cand-close').addEventListener('click', closeInfo)
}

export default menu
