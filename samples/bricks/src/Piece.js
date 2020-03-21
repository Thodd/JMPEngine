import Brick from "./Brick.js";
import ArrayHelper from "../../../src/utils/ArrayHelper.js";

class Piece {
	constructor(x, y, type) {
		this.well_x = x;
		this.well_y = y;

		this.type = type;

		let b1 = new Brick(this, 0, 0, this.type.color);
		let b2 = new Brick(this, 0, 1, this.type.color);
		let b3 = new Brick(this, 0, 2, this.type.color);
		let b4 = new Brick(this, 1, 2, this.type.color);

		this.bricks = [b1, b2, b3, b4];
	}

	move(xDif, yDif) {
		// update own position
		this.well_x += xDif;
		this.well_y += yDif;

		// trigger visual positioning of bricks relative to the piece
		for (let b of this.bricks) {
			b.updateVisualPosition();
		}
	}
}

Piece.L = {
	name: "L",
	color: Brick.COLORS.PINK,
	up:    {},
	right: {},
	down:  {},
	left:  {}
};
Piece.R = {
	name: "R",
	color: Brick.COLORS.RED,
	up:    {},
	right: {},
	down:  {},
	left:  {}
};
Piece.Z = {
	name: "Z",
	color: Brick.COLORS.GREEN,
	up:    {},
	right: {},
	down:  {},
	left:  {}
};
Piece.S = {
	name: "S",
	color: Brick.COLORS.BLUE,
	up:    {},
	right: {},
	down:  {},
	left:  {}
};
Piece.I = {
	name: "I",
	color: Brick.COLORS.PETROL,
	up:    {},
	right: {},
	down:  {},
	left:  {}
};
Piece.T = {
	name: "T",
	color: Brick.COLORS.YELLOW,
	up:    {},
	right: {},
	down:  {},
	left:  {}
};
Piece.O = {
	name: "O",
	color: Brick.COLORS.GRAY,
	up:    {},
	right: {},
	down:  {},
	left:  {}
};

const allPieces = [Piece.L, Piece.R, Piece.Z, Piece.S, Piece.I, Piece.T, Piece.O];

Piece.getRandomPieceType = () => {
	return ArrayHelper.choose(allPieces);
};

export default Piece;