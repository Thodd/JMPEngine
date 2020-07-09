import Entity from "../../../../../src/game/Entity.js";

const allPositions = {
	up:    [{ x:  16, y:   0 }, { x:  16, y: -16 }, { x:   0, y: -16 }],
	down:  [{ x: -16, y:   0 }, { x: -16, y:  16 }, { x:   0, y:  16 }],
	left:  [{ x:   0, y: -16 }, { x: -16, y: -16 }, { x: -16, y:   0 }],
	right: [{ x:   0, y: -16 }, { x: +16, y: -16 }, { x:  16, y:   0 }]
}

class SwordAttack extends Entity {
	constructor(player) {
		super();
		this.player = player;

		this.updateHitbox({
			w: 16,
			h: 16
		});

		this.cfg = {positions: allPositions.down, index: 0};

		this.setCollidable(false);
	}

	nextPosition() {
		if (this.cfg.index < 3) {
			this.cfg.index++;
		} else {
			this.cfg.index = 0;
		}
		let posData = this.cfg.positions[this.cfg.index];
		if (posData) {
			this.x = this.player.x + posData.x;
			this.y = this.player.y + posData.y;
		}
	}

	reset(dir) {
		this.cfg = {
			positions: allPositions[dir],
			index: 0
		};
		this.x = this.player.x + this.cfg.positions[0].x;
		this.y = this.player.y + this.cfg.positions[0].y;

		// reminder: also enables the debug rendering of the hitbox
		this.setCollidable(true);
	}
}

export default SwordAttack;