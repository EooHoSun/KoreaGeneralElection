function counter(elemId) {
	const dDay = new Date('2020-04-15 06:00:00').getTime()
	const el = document.getElementById(elemId)

	const intervalFunc = setInterval(() => {
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
	}, 1000)
}

export default counter
