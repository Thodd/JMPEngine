import Piece from "./Piece.js";
import ArrayHelper from "../../../src/utils/ArrayHelper.js";






// Factory?
// PieceBag.next() -> Piece instance?





class PieceBag {
	constructor() {
		this._pieces = [Piece.TYPES.L, Piece.TYPES.J, Piece.TYPES.Z, Piece.TYPES.S, Piece.TYPES.I, Piece.TYPES.T, Piece.TYPES.O];
		ArrayHelper.shuffle(this._pieces);
	}

	next() {
		return this._pieces.shift();
	}

	peek() {
		return this._pieces[0];
	}
}

export default PieceBag;