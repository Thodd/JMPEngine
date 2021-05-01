import { randomInteger, random } from "./RNG.js";

/**
 * Returns a random element from the given array.
 * If an optional range (a, b) is given, the element is taken randomly out of that range.
 * @param {Array} array the array of possible values
 * @param {int} [a] start index
 * @param {int} [b] end index
 * @returns a random element from the given array, inside the given range (a, b)
 */
function choose(array, a, b) {
	a = a || 0;
	b = b || array.length - 1;
	return array[randomInteger(a,b)];
}

/**
 * Randomizes the order of elements in the given Array.
 * @param {Array} a the array to shuffle
 * @returns the shuffled array
 */
function shuffle(a) {
	let i = 0;
	let j = 0;
	let t = null;

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
	let i = a.indexOf(e);
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

/**
 * Makes sure the given number #i is between (a,b).
 * If #i is less than #a, #a is returned.
 * If #i is greater than #b, #b is returned.
 * Else #i is returned.
 * @param {*} i
 * @param {*} a
 * @param {*} b
 */
function clamp(i, a, b) {
	if (i < a) {
		i = a;
	} else if (i > b) {
		i = b;
	}
	return i;
}

/**
 * Sets the given value to the given name inside the "jmp" namespace on the window object.
 * @param {string} name global name to be set in the "jmp" namespace
 * @param {any} o the value to be set to the global "jmp" namespace
 */
function exposeOnWindow(name, o) {
	window.jmp = window.jmp || {};
	window.jmp[name] = o;
}

export {
	choose,
	shuffle,
	remove,
	contains,
	clamp,
	exposeOnWindow
};

export default {
	choose,
	shuffle,
	remove,
	contains,
	clamp,
	exposeOnWindow
};