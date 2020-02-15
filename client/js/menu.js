const sToggleBtn = document.getElementById('v-sidebar-toggle')

export function toggleSidebar() {
	sToggleBtn.classList.toggle('is-active')
	document
		.querySelectorAll('html, #v-sidebar, #v-page-cover')
		.forEach(node => node.classList.toggle('open'))
}

function menu({ mapObj }) {
	// 사이드바 토글 클릭 이벤트
	sToggleBtn.addEventListener('click', toggleSidebar)

	// cover 클릭시에도 사이드바 닫기
	document.getElementById('v-page-cover').addEventListener('click', toggleSidebar)

	// 메뉴1: 21대 총선 정보 선택
	document.getElementById('get-electReg-btn').addEventListener('click', function() {
		toggleSidebar()
		mapObj.changeLayer(mapObj.layers.electReg)
	})

	// 메뉴2: 20대 총선 결과 선택
	document.getElementById('get-elect20-btn').addEventListener('click', function() {
		toggleSidebar()
		mapObj.changeLayer(mapObj.layers.elect20)
	})
}

export default menu
