function easeIn(a, b, p) {
	return a + (b - a) * Math.pow(p, 2);
}

function easeOut(a, b, p) {
	return a + (b - a) * (1 - Math.pow(1 - p, 2));
}

function easeInOut(a, b, p) {
	return a + (b - a) * ((-1 * Math.cos(p * Math.PI)/2) + 0.5);
}

function interpolate(a, b, p) {
	return a + (b - a) * p;
}

function fov(angle) {
	return 1 / Math.tan(angle/2);
}

function bresenham(x0, y0, x1, y1) {
	var dx = Math.abs(x1 - x0);
	var dy = Math.abs(y1 - y0);
	var sx = (x0 < x1) ? 1 : -1;
	var sy = (y0 < y1) ? 1 : -1;
	var err = dx - dy;

	var points = [];

	// eslint-disable-next-line no-constant-condition
	while (true) {
		points.push({x: x0, y: y0});

		if ((x0 == x1) && (y0 == y1)) {
			break;
		}
		var e2 = 2 * err;
		if (e2 > -1 * dy) {
			err -= dy;
			x0  += sx;
		}
		if (e2 < dx) {
			err += dx;
			y0  += sy;
		}
	}

	return points;
}

const DEG_2_RAD = Math.PI / 180;

export {
	easeIn,
	easeOut,
	easeInOut,
	interpolate,
	fov,
	bresenham,
	DEG_2_RAD
}