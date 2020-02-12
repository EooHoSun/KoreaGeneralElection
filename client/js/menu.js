const lastResultEl = document.getElementById('v-last-result')
const sToggleBtn = document.getElementById('v-sidebar-toggle')

function toggleSidebar() {
	sToggleBtn.classList.toggle('is-active')
	document.querySelectorAll('html, #v-sidebar, #v-page-cover').forEach(node => {
		node.classList.toggle('open')
	})
}

function closeInfo() {
	lastResultEl.style.display = 'none'
}

function openInfo() {
	lastResultEl.style.display = 'block'
}

function menu() {
	// 사이드바 토글 클릭 이벤트
	sToggleBtn.addEventListener('click', toggleSidebar)

	// cover 클릭시에도 사이드바 닫기
	document.getElementById('v-page-cover').addEventListener('click', toggleSidebar)

	// 20대 총선 결과
	document.getElementById('get-last-result-btn').addEventListener('click', function() {
		openInfo()
		toggleSidebar()
	})

	// 정보 조회 닫기 버튼
	document.getElementById('v-last-result-close').addEventListener('click', closeInfo)
}

export default menu
