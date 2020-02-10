import './css/index.scss'

import VoteMap from './js/votemap'
import counter from './js/counter'

function main() {
	// 카운터 실행
	counter('d-day')

	// 맵 정의
	const mapObj = new VoteMap('v-map')
	mapObj.init()
}

main()
