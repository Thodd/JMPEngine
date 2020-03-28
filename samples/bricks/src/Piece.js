import Brick from "./Brick.js";
import ArrayHelper from "../../../src/utils/ArrayHelper.js";

class Piece {
	constructor(type) {
		this.type = type;
		this.bricks = [];

		this.well_x = type.origin.x;
		this.well_y = type.origin.y;

		this.rotationIndex = 0;

		// create bricks...
		this.bricks.push(new Brick(this, this.type.color));
		this.bricks.push(new Brick(this, this.type.color));
		this.bricks.push(new Brick(this, this.type.color));
		this.bricks.push(new Brick(this, this.type.color));

		// ...we update the position now based on the rotation
		this.updateBricks();

	}

	rotate(dir) {
		// update rotation index so we get the correct relative brick coordinates during updateBricks
		this.rotationIndex = this._getNextRotationIndex(dir);
		this.updateBricks();
	}

	_getNextRotationIndex(dir) {
		let index = this.rotationIndex;
		let maxRotIndex = this.type.rotation.length - 1;

		// get next rotation definition
		if (dir == Piece.DIRECTIONS.LEFT) {
			index -= 1;
			index = index < 0 ? maxRotIndex : index;
		} else if (dir == Piece.DIRECTIONS.RIGHT) {
			index += 1;
			index = index > maxRotIndex ? 0 : index;
		}

		return index;
	}

	getBrickRotationCoordinates(dir) {
		let index = this._getNextRotationIndex(dir);
		return this.type.rotation[index];
	}

	updateBricks() {
		// change position of the single bricks in the well
		this.getBrickRotationCoordinates().forEach((r, i) => {
			this.bricks[i].x_rel = r.x;
			this.bricks[i].y_rel = r.y;
		});

		// trigger visual update
		for (let b of this.bricks) {
			b.updateVisualPosition();
		}
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

Piece.DIRECTIONS = {
	LEFT: "left",
	RIGHT: "right"
};

Piece.L = {
	name: "L",
	color: Brick.COLORS.PINK,
	origin: {x: 5, y: 1},
	rotation: [
		[{x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}, {x: -1, y: +1}], // initial
		[{x: -1, y: -1}, {x:  0, y: -1}, {x:  0, y:  0}, {x:  0, y: +1}],
		[{x: +1, y: -1}, {x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}],
		[{x:  0, y: -1}, {x:  0, y:  0}, {x:  0, y: +1}, {x: +1, y: +1}]
	]
};
Piece.J = {
	name: "J",
	color: Brick.COLORS.RED,
	origin: {x: 5, y: 1},
	rotation: [
		[{x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}, {x: +1, y: +1}], // initial
		[{x:  0, y: -1}, {x:  0, y:  0}, {x: -1, y: +1}, {x:  0, y: +1}],
		[{x: -1, y: -1}, {x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}],
		[{x:  0, y: -1}, {x: +1, y: -1}, {x:  0, y:  0}, {x:  0, y: +1}]
	]
};
Piece.Z = {
	name: "Z",
	color: Brick.COLORS.GREEN,
	origin: {x: 5, y: 1},
	rotation: [
		[{x: -1, y:  0}, {x:  0, y:  0}, {x:  0, y: +1}, {x: +1, y: +1}], // initial
		[{x: +1, y: -1}, {x:  0, y:  0}, {x: +1, y:  0}, {x:  0, y: +1}]
	]
};
Piece.S = {
	name: "S",
	color: Brick.COLORS.BLUE,
	origin: {x: 5, y: 1},
	rotation: [
		[{x:  0, y:  0}, {x: +1, y:  0}, {x: -1, y: +1}, {x:  0, y: +1}], // initial
		[{x:  0, y: -1}, {x:  0, y:  0}, {x: +1, y:  0}, {x: +1, y: +1}]
	]
};
Piece.I = {
	name: "I",
	color: Brick.COLORS.PETROL,
	origin: {x: 5, y: 1},
	rotation: [
		[{x: -2, y:  0}, {x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}], // initial
		[{x:  0, y: -1}, {x:  0, y:  0}, {x:  0, y: +1}, {x:  0, y: +2}]
	]
};
Piece.T = {
	name: "T",
	color: Brick.COLORS.YELLOW,
	origin: {x: 5, y: 1},
	rotation: [
		[{x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}, {x:  0, y: +1}], // initial
		[{x:  0, y: -1}, {x:  0, y:  0}, {x: +1, y:  0}, {x:  0, y: +1}],
		[{x:  0, y: -1}, {x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}],
		[{x:  0, y: -1}, {x: -1, y:  0}, {x:  0, y:  0}, {x:  0, y: +1}]
	]
};
Piece.O = {
	name: "O",
	color: Brick.COLORS.GRAY,
	origin: {x: 4, y: 1},
	rotation: [
		[{x:  0, y:  0}, {x: +1, y:  0}, {x:  0, y: +1}, {x: +1, y: +1}] // initial
	]
};

const allPieces = [Piece.L, Piece.J, Piece.Z, Piece.S, Piece.I, Piece.T, Piece.O];

Piece.getRandomPieceType = () => {
	return ArrayHelper.choose(allPieces);
};

export default Piece;