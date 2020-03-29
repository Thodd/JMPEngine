import Entity from "../../../src/game/Entity.js";
import Well from "./Well.js";
import Spritesheets from "../../../src/gfx/Spritesheets.js";

class Brick extends Entity {
	constructor(piece, color) {
		// initial position of the entity is irrelevant
		// we update the render coordinates later
		super(0, 0);

		this.layer = 1;

		// the bricks are positioned relative to the piece
		this.x_rel = 0;
		this.y_rel = 0;

		this.piece = piece;

		this.setSprite({
			sheet: "bricks",
			id: color
		});

		this.updateVisualPosition();
	}

	updateVisualPosition() {
		// calculate the screen position of the brick, based on the individual well position (x, y)
		let sheet = Spritesheets.getSheet("bricks");
		this.x = (Well.ORIGIN_X + this.piece.well_x + this.x_rel) * sheet.w;
		this.y = (Well.ORIGIN_Y + this.piece.well_y + this.y_rel) * sheet.h;
	}
}

Brick.COLORS = {
	PETROL: 0,
	BLUE:   1,
	GREEN:  2,
	YELLOW: 3,
	RED:    4,
	PINK:   5,
	GRAY:   6
};

export default Brick;