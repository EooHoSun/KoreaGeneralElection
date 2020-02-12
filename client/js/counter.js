function counter(elemId) {
	const dDay = new Date('2020-04-15T06:00:00').getTime()
	const el = document.getElementById(elemId)
	let intervalFunc = null

	const setCounter = () => {
		const now = new Date().getTime()
		const distance = dDay - now
		const days = Math.floor(distance / (1000 * 60 * 60 * 24))
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
		const seconds = Math.floor((distance % (1000 * 60)) / 1000)

		el.innerHTML = `D-${days} ${hours}:${minutes}:${seconds}`
		if (distance < 0) {
			clearInterval(intervalFunc)
			el.innerHTML = 'D-DAY'
		}
	}

	setCounter() // 초기 한번 실행
	intervalFunc = setInterval(setCounter, 1000) // 1초마다 반복 실행
}

export default counter
