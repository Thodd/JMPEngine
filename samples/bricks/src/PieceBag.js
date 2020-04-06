//import RNG from "../../../src/utils/RNG.js";
import ArrayHelper from "../../../src/utils/ArrayHelper.js";
import Piece from "./Piece.js";

const allTypes = [Piece.TYPES.L, Piece.TYPES.J, Piece.TYPES.Z, Piece.TYPES.S, Piece.TYPES.I, Piece.TYPES.T, Piece.TYPES.O];

// RNG.seed(678);

let typeBag = allTypes.slice().concat(allTypes.slice());
ArrayHelper.shuffle(typeBag);

function fillBag() {
	let h = allTypes.slice();
	ArrayHelper.shuffle(h);
	typeBag = typeBag.concat(h);
}

const PieceBag = {
	/**
	 * Returns the next scheduled Piece used for Gameplay.
	 */
	next() {
		if (typeBag.length === 0) {
			fillBag();
		}

		let t = typeBag.shift();

		return this.create(t);
	},

	/**
	 * Returns the top 'n' types scheduled.
	 * @param {int} n the number of types which should be peeked
	 */
	peek(n) {
		// fill up the bag if the given peek number 'n' cannot be satisfied
		let next = typeBag.slice(0, n);
		if (next.length < n) {
			fillBag();
		}
		next = typeBag.slice(0, n);
		return next;
	},

	/**
	 * Piece Factory, creates a new Piece instance.
	 * Can either be a visual or a gameplay (default) piece.
	 *
	 * @param {Piece.TYPES} type the type of the piece
	 * @param {boolean} visualOnly whether the piece is only for visuals or a gameplay piece
	 */
	create(type, visualOnly) {
		return new Piece(type, visualOnly);
	}
}

export default PieceBag;