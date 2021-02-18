import DebugMode from "../../../../../src/utils/DebugMode.js";
import Entity from "../../../../../src/game/Entity.js";

class DropItem extends Entity {
	constructor(release) {
		super(0,0);

		this._release = release;

		if (DebugMode.enabled) {
			this.RENDER_HITBOX = 0xFFFF00;
		}

		this.updateHitbox({
			x: 2,
			y: 2,
			w: 12,
			h: 12
		});
	}

	setType(type) {
		this._type = type;

		// TODO: set sprite based on type
		this.configSprite({
			sheet: "drops",
			id: 0
		});
	}

	activate() {
		this.visible = true;
		this.active = true;
	}

	deactivate() {
		this.visible = false;
		this.active = false;
	}

	update() {
		// handle collision with player -> return to pool
		let player = this.getScreen().getPlayer();

		if (this.collidesWith(player)) {
			this._release(this);
			player.heal(1);
		}
	}
}

export default DropItem;