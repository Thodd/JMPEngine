import Actor from "../Actor.js";
import Constants from "../../Constants.js";
import { log } from "../../../../../src/utils/Log.js";

const _hitboxOffset = {
	"down": {
		x: Constants.TILE_WIDTH/4,
		y: Constants.TILE_HEIGHT
	},
	"up": {
		x: Constants.TILE_WIDTH/4,
		y: -Constants.TILE_HEIGHT/2
	},
	"right": {
		x: Constants.TILE_WIDTH,
		y: Constants.TILE_HEIGHT/4
	},
	"left": {
		x: -Constants.TILE_WIDTH/2,
		y: Constants.TILE_HEIGHT/4
	}
}

class Interactable extends Actor {
	constructor(x, y, directions = ["down"]) {
		super(x, y);

		// interactables have a hitbox which is moved depending on the player's looking direction
		// it's practically inverted, e.g. The interaction direction is to the left, but the player has to face right
		this._playerDirectionToHitboxPosition = {};
		for(let d of directions) {
			if (d == "down") {
				this._playerDirectionToHitboxPosition["up"] = _hitboxOffset["down"];
			}
			if (d == "up") {
				this._playerDirectionToHitboxPosition["down"] = _hitboxOffset["up"];
			}
			if (d == "left") {
				this._playerDirectionToHitboxPosition["right"] = _hitboxOffset["left"];
			}
			if (d == "right") {
				this._playerDirectionToHitboxPosition["left"] = _hitboxOffset["right"];
			}
		}

		// size
		this.updateHitbox({
			w: Constants.TILE_WIDTH/2,
			h: Constants.TILE_HEIGHT/2
		});
		// position
		this.updateHitbox(_hitboxOffset.down);
	}

	update() {
		// only do this stuff if an interact function is defined
		if (this.interact) {
			// Interactables have a simple collision detection against the player to see if the player is looking at them
			// and if the player is in side the small interactable area hitbox
			let player = this.getScreen().getPlayer();
			let hb = this._playerDirectionToHitboxPosition[player.dir];
			if (hb) {
				this.updateHitbox(hb);
			} else {
				this.setCollidable(false);
			}

			if (this.collidesWith(player)) {
				this.interact();
			}
		}
	}


}

export default Interactable;