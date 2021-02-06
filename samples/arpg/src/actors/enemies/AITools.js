const AITools = {
	inRange(x1, y1, x2, y2, distance) {
		return Math.abs(x1 - x2) < distance && Math.abs(y1 - y2) < distance;
	}
}

export default AITools;