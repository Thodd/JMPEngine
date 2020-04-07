import Brick from "./Brick.js";
import Well from "./Well.js";

class Piece {
	/**
	 * Piece constructor.
	 * @param {Piece.TYPES} type The type of the brick, e.g. "L"
	 * @param {boolean} visualOnly whether the Piece is only for visualization and not gameplay, e.g. for the NEXT section
	 */
	constructor(type, visualOnly = false) {
		this.type = type;
		this.visualOnly = visualOnly;
		this.bricks = [];

		this.well_x = 0;
		this.well_y = 0;

		this.rotationIndex = 0;

		// if the piece is only used for visualization, the renderOrigin of the bricks is 0,0
		// otherwise the bricks will be rendered relative to the Well's origin.
		let brickRenderOrigin = visualOnly ? {x: 0, y: 0} : {x: Well.ORIGIN_X, y: Well.ORIGIN_Y};

		// create bricks...
		this.bricks.push(new Brick(this, this.type.color, brickRenderOrigin));
		this.bricks.push(new Brick(this, this.type.color, brickRenderOrigin));
		this.bricks.push(new Brick(this, this.type.color, brickRenderOrigin));
		this.bricks.push(new Brick(this, this.type.color, brickRenderOrigin));

		// ...we update the actual position now based on the rotation
		this._updateBricks(type.origin.x, type.origin.y);
	}

	rotate(dir, xDif=0, yDif=0) {
		this._updateBricks(xDif, yDif, dir);
	}

	move(xDif=0, yDif=0) {
		this._updateBricks(xDif, yDif);
	}

	lock() {
		this._lockedIn = true;

		this.bricks.forEach((b) => {
			b.lock();
		})
	}

	getBrickRotationCoordinates(dir) {
		let index = this._getNextRotationIndex(dir);
		return this.type.rotation[index];
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

	_updateBricks(xDif, yDif, dir) {
		// update x/y position
		this.well_x += xDif;
		this.well_y += yDif;

		// update rotation index so we get the correct relative brick coordinates during updateBricks
		this.rotationIndex = this._getNextRotationIndex(dir);

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
}

Piece.DIRECTIONS = {
	LEFT: "left",
	RIGHT: "right"
};

Piece.TYPES = {};

Piece.TYPES.L = {
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
Piece.TYPES.J = {
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
Piece.TYPES.Z = {
	name: "Z",
	color: Brick.COLORS.GREEN,
	origin: {x: 5, y: 1},
	rotation: [
		[{x: -1, y:  0}, {x:  0, y:  0}, {x:  0, y: +1}, {x: +1, y: +1}], // initial
		[{x: +1, y: -1}, {x:  0, y:  0}, {x: +1, y:  0}, {x:  0, y: +1}]
	]
};
Piece.TYPES.S = {
	name: "S",
	color: Brick.COLORS.BLUE,
	origin: {x: 5, y: 1},
	rotation: [
		[{x:  0, y:  0}, {x: +1, y:  0}, {x: -1, y: +1}, {x:  0, y: +1}], // initial
		[{x:  0, y: -1}, {x:  0, y:  0}, {x: +1, y:  0}, {x: +1, y: +1}]
	]
};
Piece.TYPES.I = {
	name: "I",
	color: Brick.COLORS.PETROL,
	origin: {x: 5, y: 1},
	rotation: [
		[{x: -2, y:  0}, {x: -1, y:  0}, {x:  0, y:  0}, {x: +1, y:  0}], // initial
		[{x:  0, y: -1}, {x:  0, y:  0}, {x:  0, y: +1}, {x:  0, y: +2}]
	]
};
Piece.TYPES.T = {
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
Piece.TYPES.O = {
	name: "O",
	color: Brick.COLORS.GRAY,
	origin: {x: 4, y: 1},
	rotation: [
		[{x:  0, y:  0}, {x: +1, y:  0}, {x:  0, y: +1}, {x: +1, y: +1}] // initial
	]
};

export default Piece;