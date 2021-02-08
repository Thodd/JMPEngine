const M4th = {
	inRange(x1, y1, x2, y2, distance) {
		return Math.abs(x1 - x2) < distance && Math.abs(y1 - y2) < distance;
	},

	angle(x1, y1, x2, y2) {
		let x = x1 - x2;
		let y = y1 - y2;
		let deg = Math.atan2(y, x) / Math.PI * 180; //atan2 is in rad!
		if (deg < 0) {
			deg += 360;
		}

		return deg;
	}
};

export default M4th;