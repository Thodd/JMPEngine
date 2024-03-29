import Entity from "../../../src/game/Entity.js";
import Spritesheets from "../../../src/assets/Spritesheets.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";

class Brick extends Entity {
	constructor(piece, color, renderOrigin, ghost=false) {
		// initial position of the entity is irrelevant
		// we update the render coordinates later
		super(0, 0);

		// a ghost brick should be rendered below a regular brick
		this.layer = ghost ? 2 : 3;

		// the bricks are positioned relative to the piece
		this.x_rel = 0;
		this.y_rel = 0;

		// final coordinates after the bricks is locked
		this._locked = false;

		this.piece = piece;

		this.configSprite({
			sheet: "bricks",
			//id: color,
			animations: {
				default: "normal",
				"normal": {
					frames: [color]
				},
				"dying": {
					frames: [color, 42],
					dt: 4
				}
			}
		});

		this._pixiSprite.alpha = ghost ? 0.3 : 1;

		this.renderOrigin = renderOrigin;

		// "death" animation... i couldn't come up with a better name...
		this.dying = false;
		this.dyingFrameCounter = new FrameCounter(15);

		this.updateVisualPosition();
	}

	lock() {
		this._locked = true;
		this.x_final = this.piece.well_x + this.x_rel;
		this.y_final = this.piece.well_y + this.y_rel;
		delete this.piece;
		this.updateVisualPosition();
	}

	update() {
		// If the brick is "dying", we wait for the animation to end and then destroy the brick.
		// When the dying promise is resolved, the GameScreen will react to it.
		if (this.dying) {
			if (this.dyingFrameCounter.isReady()){
				this._dyingResolve();
				this.destroy();
			}
		}
	}

	die() {
		this.dying = new Promise((res) => {
			this._dyingResolve = res;
		});
		this.playAnimation({name: "dying"});
		return this.dying;
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