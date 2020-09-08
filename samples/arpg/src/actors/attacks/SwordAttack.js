import Actor from "../Actor.js";
import Tileset from "../../mapgen/Tileset.js";
import SmallEffect from "../effects/SmallEffect.js";

const allPositions = {
	up:    [{ x:  16, y:   0 }, { x:  16, y: -16 }, { x:   0, y: -16 }],
	down:  [{ x: -16, y:   0 }, { x: -16, y:  16 }, { x:   0, y:  16 }],
	left:  [{ x:   0, y: -16 }, { x: -16, y: -16 }, { x: -16, y:   0 }],
	right: [{ x:   0, y: -16 }, { x: +16, y: -16 }, { x:  16, y:   0 }]
}

class SwordAttack extends Actor {
	constructor(player) {
		super();
		this.player = player;

		this.updateHitbox({
			w: 18,
			h: 18
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

		this.checkTileBasedCollision();
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

		this.checkTileBasedCollision();
	}

	checkTileBasedCollision() {
		let tile = this.getClosestTile();
		let showEffect = false;

		if (tile.type === Tileset.Types.GRASS || tile.type === Tileset.Types.BUSH) {
			let tileInfo = Tileset.getProperties(`${tile.type}_cut`);
			tile.set(tileInfo.id);
			showEffect = true;
		}

		if (showEffect) {
			// create grass cutting effect and position it on the screen
			let grassCuttingEffect = SmallEffect.get();
			grassCuttingEffect.x = tile.screenX;
			grassCuttingEffect.y = tile.screenY;
			grassCuttingEffect.show();
			this.getScreen().add(grassCuttingEffect);
		}
	}
}

export default SwordAttack;