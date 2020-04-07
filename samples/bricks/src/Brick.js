import Entity from "../../../src/game/Entity.js";
import Spritesheets from "../../../src/gfx/Spritesheets.js";

class Brick extends Entity {
	constructor(piece, color, renderOrigin) {
		// initial position of the entity is irrelevant
		// we update the render coordinates later
		super(0, 0);

		this.layer = 1;

		// the bricks are positioned relative to the piece
		this.x_rel = 0;
		this.y_rel = 0;

		// final coordinates after the bricks is locked
		this._locked = false;

		this.piece = piece;

		this.setSprite({
			sheet: "bricks",
			id: color
		});

		this.renderOrigin = renderOrigin;

		this.updateVisualPosition();
	}

	lock() {
		this._locked = true;
		this.x_final = this.piece.well_x + this.x_rel;
		this.y_final = this.piece.well_y + this.y_rel;
		delete this.piece;
		this.updateVisualPosition();
	}

	updateVisualPosition() {
		// calculate the screen position of the brick, based on the individual well position (x, y)
		let sheet = Spritesheets.getSheet("bricks");
		let xx = this._locked ? this.x_final : this.piece.well_x + this.x_rel;
		let yy = this._locked ? this.y_final : this.piece.well_y + this.y_rel;

		this.x = (this.renderOrigin.x + xx) * sheet.w;
		this.y = (this.renderOrigin.y + yy) * sheet.h;
	}

	getWellCoordinates() {
		// returns final coordinates if already set
		return {
			x: this._locked ? this.x_final : (this.piece.well_x + this.x_rel),
			y: this._locked ? this.y_final : (this.piece.well_y + this.y_rel)
		};
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