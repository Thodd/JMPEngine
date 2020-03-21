import { error } from "../../../src/utils/Log.js";

let currScreen;
let field = [];

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
		// mark bricks of the piece in well
		for (let b of p.bricks) {
			field[p.well_x + b.well_x][p.well_y + b.well_y] = b;
		}

		// add bricks to the screen
		p.bricks.forEach((b) => {
			currScreen.add(b);
		});
	},

	movePiece(p, xDif, yDif) {
		// check new position for collision
		let collision = false;


		// TODO: refactor to remove try catch -> check if coordinates are inside Well only



		try {
			for (let b of p.bricks) {
				let newX = p.well_x + xDif + b.well_x;
				let newY = p.well_y + yDif + b.well_y;
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
			error(`moving piece not possible, bricks are out of bounds: (${p.well_x}, ${p.well_y})`);
		}

		// no collision found, move piece and update field
		if (!collision) {
			// remove old position from field
			for (let b of p.bricks) {
				field[p.well_x + b.well_x][p.well_y + b.well_y] = undefined;
			}

			// move to new position
			p.move(xDif, yDif);

			for (let b of p.bricks) {
				field[p.well_x + b.well_x][p.well_y + b.well_y] = b;
			}
		}
	},

	getPiece(x, y) {
		return field[x][y].piece;
	},

	getBrick(x, y) {
		return field[x][y];
	}
}

// the visual origin of the Well (in tiles)
// will be used by the Brick to render at the correct spot
Well.ORIGIN_X = 13;
Well.ORIGIN_Y = 2;

Well.WIDTH = 10;
Well.HEIGHT = 20;

window.well = Well;

export default Well;