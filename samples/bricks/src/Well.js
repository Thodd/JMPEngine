import { log } from "../../../src/utils/Log.js";

let currScreen;
let field = [];

let currentPiece;

const Well = {
	init(gs) {
		currScreen = gs;

		field = [];
		for (let x = 0; x < Well.WIDTH; x++) {
			field[x] = [];
			field[x][Well.HEIGHT-1] = undefined;
		}
	},

	addPiece(p, isCurrentPiece=true) {
		// mark bricks of the piece in well
		for (let b of p.bricks) {
			field[p.well_x + b.x_rel][p.well_y + b.y_rel] = b;
		}

		// add bricks to the screen
		p.bricks.forEach((b) => {
			currScreen.add(b);
		});

		if (isCurrentPiece) {
			currentPiece = p;
		}
	},

	rotatePiece(p, dir) {
		let newBricksRelCoords = p.getBrickRotationCoordinates(dir);
		let collision = this.pieceCanBeMovedTo(p, 0, 0, newBricksRelCoords);

		// no collision found at the intended rotation position
		if (!collision) {
			this._updatePiece(p, p.rotate.bind(p, dir));
		} else {
			// simple rotation doesn't work, so try a wall- or floorkick

			// wallkicks
			if (p.well_x == 0) { // piece sits on left wall
				log("bitw_l");
				// try to move the piece one tile to the right
				collision = this.pieceCanBeMovedTo(p, 1, 0, newBricksRelCoords);
				if (!collision) {
					this._updatePiece(p, p.rotate.bind(p, dir, 1, 0));
					return;
				}
			} else {
				if (p.well_x == Well.WIDTH - 1) { // piece sits on right wall
					log("bitw_r");
					// try to move the piece one tile to the right
					collision = this.pieceCanBeMovedTo(p, -1, 0, newBricksRelCoords);
					if (!collision) {
						this._updatePiece(p, p.rotate.bind(p, dir, -1, 0));
						return;
					}
				}
			}

			// floorkick if wallkick didn't work
			collision = this.pieceCanBeMovedTo(p, 0, -1, newBricksRelCoords);
			if (!collision) {
				this._updatePiece(p, p.rotate.bind(p, dir, 0, -1));
			}
		}
	},

	movePiece(p, xDif, yDif) {
		let collision = this.pieceCanBeMovedTo(p, xDif, yDif, p.getBrickRotationCoordinates());
		// no collision found, move piece and update field
		if (!collision) {
			this._updatePiece(p, p.move.bind(p, xDif, yDif));
		}
	},

	/**
	 * Updates the given Piece inside the Well.
	 * All bricks will be removed from their old position in the well
	 * and be moved to their new position.
	 * Should only be called after a collision checks.
	 *
	 * @param {Piece} p Piece instance
	 * @param {function} updateBrick update function for the visuals of the Piece;
	 *                        The update function is bound to the correct movement arguments.
	 *                        Either Piece.prototype.rotate or Piece.prototype.move.
	 */
	_updatePiece(p, updateBrick) {
		// remove old position from field
		for (let b of p.bricks) {
			field[p.well_x + b.x_rel][p.well_y + b.y_rel] = undefined;
		}

		// update function is bound with brick and additional update arguments, e.g. rotation direction
		updateBrick();

		// place the moved bricks back into the well
		for (let b of p.bricks) {
			field[p.well_x + b.x_rel][p.well_y + b.y_rel] = b;
		}
	},

	/**
	 * Checks if the given Piece can be moved to the new coordinates.
	 * @param {Piece} p the Piece
	 * @param {int} xDif the x modifier for the Piece instance.
	 *                   The Piece will be virtually moved to this relative coordinates during collision check.
	 * @param {int} yDif the y modifier for the Piece instance.
	 *                   The Piece will be virtually moved to this relative coordinates during collision check.
	 * @param {object[]} newBricksRelCoords an array of the new brick coordinates relative to the origin of the Piece instance
	 */
	pieceCanBeMovedTo(p, xDif, yDif, newBricksRelCoords) {
		// check new position for collision
		let collision = false;

		// TODO: refactor to remove try catch -> check if coordinates are inside Well only
		try {
			for (let b of newBricksRelCoords) {
				let newX = p.well_x + xDif + b.x;
				let newY = p.well_y + yDif + b.y;
				let newPosBrick = field[newX][newY];
				// check if position is outside of Well dimensions OR
				// place is occupied, but only for pieces other than the currently moving piece
				if (newX >= Well.WIDTH || newX < 0 ||
					newY >= Well.HEIGHT || newY < 0 ||
					(newPosBrick && newPosBrick.piece != p)) {
					collision = true;
					break;
				}
			}
		} catch(e) {
			collision = true;
			// log(`moving piece not possible, bricks are out of bounds: (${p.well_x}, ${p.well_y})`, "Well");
		}

		return collision;
	},

	getPiece(x, y) {
		return field[x][y].piece;
	},

	getBrick(x, y) {
		return field[x][y];
	},

	getCurrentPiece() {
		return currentPiece;
	},

	// should only be needed for debugging
	getField() {
		return field;
	}

};

// the visual origin of the Well (in tiles)
// will be used by the Brick to render at the correct spot
Well.ORIGIN_X = 13;
Well.ORIGIN_Y = 2;

Well.WIDTH = 10;
Well.HEIGHT = 20;

window.Well = Well;

export default Well;