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

const DEG_2_RAD = Math.PI / 180;

export {
	easeIn,
	easeOut,
	easeInOut,
	interpolate,
	fov,
	DEG_2_RAD
}