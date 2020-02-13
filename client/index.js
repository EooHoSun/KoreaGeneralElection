import './css/index.scss'

import VoteMap from './js/votemap'
import counter from './js/counter'
import menu from './js/menu'

function main() {
	const global = {}

	// 카운터 실행
	counter('d-day')

	// 맵 정의
	global.mapObj = new VoteMap('v-map')

	// 메뉴
	menu(global)
}

main()
