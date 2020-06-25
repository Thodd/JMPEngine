import Entity from "../../../../../src/game/Entity.js";
import FrameCounter from "../../../../../src/utils/FrameCounter.js";

const allPositions = {
	down: [{ x: 16, y: 0 }, { x: 16, y: 16 }, { x: 0, y: 16 }]
}

class SwordAttack extends Entity {
	constructor(player) {
		super();
		this.player = player;

		//this.RENDER_HITBOXES = "#FF008533";

		this.hitbox.w = 16;
		this.hitbox.h = 16;

		this.cfg = {positions: allPositions.down, index: 0};
	}

	nextPosition() {
		this.cfg.index++;
		let posData = this.cfg.positions[this.cfg.index];
		this.x = this.player.x + posData.x;
		this.y = this.player.y + posData.y;
	}
}

export default SwordAttack;