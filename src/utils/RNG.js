import { log } from "./Log.js";

/**
 * Seeds the RNG. Returns a new function.
 * From stackoverflow.com, by "Antti Sykäri" and "Remco Kranenburg".
 *
 * @param {*} iSeed
 * @param {*} bUseAsDefault
 */
function seed(iSeed, bUseAsDefault) {
	var fnRnd = function() {
		iSeed = Math.sin(iSeed) * 10000;
		return iSeed - Math.floor(iSeed);
	};
	if (bUseAsDefault) {
		_random = fnRnd;
		log("Default random() function replaced. Seed: " + iSeed, "Utils");
	}
	return fnRnd;
}

let _random = seed(123456);

function random() {
	// use seeded function internally, can be set globally via seed(..., true)
	return _random();
}

function randomInteger(a, b) {
	return Math.floor(random() * (b - a + 1)) + a;
}

function randomFloat(a, b) {
	return random() * (b - a) + a;
}

export {
	// numbers
	seed,
	random,
	randomInteger,
	randomFloat
}

export default {
	// numbers
	seed,
	random,
	randomInteger,
	randomFloat
}