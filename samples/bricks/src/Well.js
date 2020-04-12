import { log } from "../../../src/utils/Log.js";
import PieceBag from "./PieceBag.js";

let currScreen;
let field = [];

let currentPiece;
let ghostPiece;

const Well = {
	init(gs) {
		currScreen = gs;

		field = [];
		for (let x = 0; x < Well.WIDTH; x++) {
			field[x] = [];
			field[x][Well.HEIGHT-1] = undefined;
		}
	},

	addPiece(p) {
		let overlap = false;

		// add bricks to the screen
		p.bricks.forEach((b) => {
			// mark bricks of the piece in well
			// if the field coordinates are already marked with a brick we know that the player has reached a game-over
			let pos = field[p.well_x + b.x_rel][p.well_y + b.y_rel];
			if (pos) {
				overlap = true;
			}
			// update the coordinates anyway
			field[p.well_x + b.x_rel][p.well_y + b.y_rel] = b;
			currScreen.add(b);
		});

		currentPiece = p;

		// create ghost bricks
		ghostPiece = PieceBag.ghost(p);
		ghostPiece.bricks.forEach((b) => {
			currScreen.add(b);
		});

		return overlap;
	},

	removePiece() {
		// by default we remove the current piece if none is given
		currentPiece.bricks.forEach((b) => {
			delete field[currentPiece.well_x + b.x_rel][currentPiece.well_y + b.y_rel];
		});
		currentPiece.destroy();
		ghostPiece.destroy();
	},

	rotatePiece(p, dir) {
		let newBricksRelCoords = p.getBrickRotationCoordinates(dir);
		let collision = this.isOccupied(p, 0, 0, newBricksRelCoords);

		// no collision found at the intended rotation position
		if (!collision) {
			this._updatePiece(p, p.rotate.bind(p, dir));
		} else {
			// simple rotation doesn't work, so try a wall- or floorkick

			// wallkicks
			if (p.well_x == 0) { // piece sits on left wall
				log("bitw_l");
				// try to move the piece one tile to the right
				collision = this.isOccupied(p, 1, 0, newBricksRelCoords);
				if (!collision) {
					this._updatePiece(p, p.rotate.bind(p, dir, 1, 0));
				}
			} else {
				if (p.well_x == Well.WIDTH - 1) { // piece sits on right wall
					log("bitw_r");
					// try to move the piece one tile to the right
					collision = this.isOccupied(p, -1, 0, newBricksRelCoords);
					if (!collision) {
						this._updatePiece(p, p.rotate.bind(p, dir, -1, 0));
					}
				} else {
					// floorkick if wallkick didn't work
					collision = this.isOccupied(p, 0, -1, newBricksRelCoords);
					if (!collision) {
						this._updatePiece(p, p.rotate.bind(p, dir, 0, -1));
					}
				}
			}

		}
		return collision;
	},

	movePiece(p, xDif, yDif) {
		let collision = this.isOccupied(p, xDif, yDif, p.getBrickRotationCoordinates());
		// no collision found, move piece and update field
		if (!collision) {
			this._updatePiece(p, p.move.bind(p, xDif, yDif));
		}
		return collision;
	},

	/**
	 * Updates the given Piece inside the Well.
	 * All bricks will be removed from their old position in the well
	 * and be moved to their new position.
	 * Should only be called after a collision checks.
	 *
	 * @param {Piece} p Piece instance
	 * @param {function} updateBricks update function for the visuals of the Piece;
	 *                        The update function is bound to the correct movement arguments.
	 *                        Either Piece.prototype.rotate or Piece.prototype.move.
	 */
	_updatePiece(p, updateBricks) {
		// remove old position from field
		for (let b of p.bricks) {
			field[p.well_x + b.x_rel][p.well_y + b.y_rel] = undefined;
		}

		// update function is bound with brick and additional update arguments, e.g. rotation direction
		updateBricks();

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
	isOccupied(p, xDif, yDif, newBricksRelCoords) {
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

	/**
	 * Calculates which rows of bricks can be removed.
	 */
	cleanUp() {
		let clearedRows = [];

		// loop from bottom to top
		for (let y = 0; y < Well.HEIGHT; y++) {
			let bricksPerRow = this.getBricksInRow(y);

			// row is fully filled from 0 to the width of the well
			if (bricksPerRow.length == Well.WIDTH) {
				clearedRows.push({
					bricks: bricksPerRow,
					y: y
				});
			}
		}

		// iterate cleared rows from top to bottom
		let allRowAnimations = [];
		clearedRows.forEach((row) => {
			let bricksPerRowAnimation = [];
			// clear a row
			row.bricks.forEach((b) => {
				bricksPerRowAnimation.push(b.die().then(() => {
					let coords = b.getWellCoordinates();
					// clear position in well, so it can be occupied with a new brick
					delete field[coords.x][coords.y];
				}));
			});

			allRowAnimations.push(Promise.all(bricksPerRowAnimation).then(() => {
				// move rows down by one
				this.dropRows(row.y);
			}));
		});

		if (allRowAnimations.length > 0) {
			// In the GameScreen we need to know if we need to wait for a clean-up animation
			return Promise.all(allRowAnimations);
		} else {
			// false if no animation is necessary
			return false;
		}
	},

	getBricksInRow(y, includeEmpty) {
		let bricks = [];
		for (let x = 0; x < Well.WIDTH; x++) {
			if (field[x][y]) {
				bricks.push(field[x][y]);
			} else if (includeEmpty) {
				// for cleaning rows we need to keep track of the empty bricks
				// they have to be moved down too once a row beneath is cleared
				bricks.push(undefined);
			}
		}
		return bricks;
	},

	/**
	 * Dropws the rows above the given index by 1.
	 * Assumption is
	 * @param {int} yStart row index, all rows above will be dropped by 1
	 */
	dropRows(yStart) {
		for (let y = yStart - 1; y > 0; y--) {
			let bricks = this.getBricksInRow(y, true);
			bricks.forEach((b, x) => {
				// clear old position
				field[x][y] = undefined;
				// move brick to new position
				field[x][y+1] = b;
				if (b) {
					b.y_final += 1;
					b.updateVisualPosition();
				}
			});
		}
	},

	lockCurrentPiece() {
		currentPiece.lock();
		ghostPiece.destroy();
	},

	/**
	 * Update the position of the Ghost Piece
	 */
	updateGhostPiece() {
		// rotation
		ghostPiece.rotationIndex = currentPiece.rotationIndex;

		// position
		ghostPiece.well_x = currentPiece.well_x;
		ghostPiece.well_y = currentPiece.well_y;

		for (let i = 0; i < 20; i++) {
			if (!this.isOccupied(currentPiece, 0, i+1, currentPiece.getBrickRotationCoordinates())) {
				ghostPiece.well_y += 1;
			} else {
				break;
			}
		}

		ghostPiece._updateBricks();
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