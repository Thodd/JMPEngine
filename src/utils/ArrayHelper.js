import {randomInteger, random} from "./RNG.js";

function choose(array, a, b) {
	a = a || 0;
	b = b || array.length - 1;
	return array[randomInteger(a,b)];
}

function shuffle(a) {
	var i = 0;
	var j = 0;
	var t = null;

	for (i = a.length - 1; i > 0; i -= 1) {
		j = Math.floor(random() * (i + 1));
		t = a[i];
		a[i] = a[j];
		a[j] = t;
	}
	return a;
}

/**
 * Removes the given object from the given array.
 * Returns true if the object was removed, false otherwise.
 * @param {*} e
 * @param {array} a
 */
function remove(e, a) {
	var i = a.indexOf(e);
	if (i >= 0) {
		a.splice(i, 1);
		return true;
	}
	return false;
}

/**
 * Checks if the given object is inside the given array.
 * @param {*} e
 * @param {*} a
 */
function contains(e, a) {
	return a.indexOf(e) >= 0;
}

export default {
	choose,
	shuffle,
	remove,
	contains
};