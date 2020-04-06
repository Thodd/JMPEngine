let _seed = 12345;

function seed(s) {
	_seed = s;
}

function random() {
	_seed = Math.sin(_seed) * 10000;
	return _seed - Math.floor(_seed);
}

function randomInteger(a, b) {
	return Math.floor(random() * (b - a + 1)) + a;
}

function randomFloat(a, b) {
	return random() * (b - a) + a;
}

export {
	seed,
	random,
	randomInteger,
	randomFloat
}

export default {
	seed,
	random,
	randomInteger,
	randomFloat
}