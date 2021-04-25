const Algos = {
	/**
	 * Returns an array of points on a rasterized line.
	 */
	bresenham(x0, y0, x1, y1) {
		var dx = Math.abs(x1 - x0);
		var dy = Math.abs(y1 - y0);
		var sx = (x0 < x1) ? 1 : -1;
		var sy = (y0 < y1) ? 1 : -1;
		var iErr = dx - dy;

		var aPoints = [];

		// eslint-disable-next-line no-constant-condition
		while (true) {
			aPoints.push({x: x0, y: y0});

			if ((x0 == x1) && (y0 == y1)) {
				break;
			}
			var e2 = 2 * iErr;
			if (e2 > -1 * dy) {
				iErr -= dy;
				x0  += sx;
			}
			if (e2 < dx) {
				iErr += dx;
				y0  += sy;
			}
		}

		return aPoints;
	}
};

export default Algos;