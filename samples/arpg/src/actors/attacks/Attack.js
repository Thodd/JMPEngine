import DebugMode from "../../../../../src/utils/DebugMode.js";
import Actor from "../Actor.js";

/**
 * Defines the basic lifecycle of Attacks.
 * Synchronized via the Player animations.
 * Each key-frame updates the (melee) attack animations.
 * @abstract
 */
class Attack extends Actor {
	constructor(player) {
		super(0, 0);
		this.player = player;

		this.active = false;
		this.visible = false;

		if (DebugMode.enabled) {
			this.RENDER_HITBOX = 0x0085FF;
		}

		this.updateHitbox({
			w: 18,
			h: 18
		});

		this.configSprite({
			sheet: "attacks",
			id: 15
		});

		this.setTypes(["attack"]);

		this.setCollidable(false);
	}

	update() {
		// IMPORTANT: no super call
		// the Attack-Actors don't need hit detection and knockback themselves

		// keep attack positioned at the player's coordinates
		// this way the weapon is not left behind if the player is knocked back during attacking
		let frameData = this._currentAttackInfo.frames[this._currentAttackInfo.index];
		this._updateVisuals(frameData);
	}

	/**
	 * Positions the Attack Hitbox at the next animation position.
	 */
	next() {
		if (this._currentAttackInfo.index < 3) {
			this._currentAttackInfo.index++;
		} else {
			this._currentAttackInfo.index = 0;
		}

		let frameData = this._currentAttackInfo.frames[this._currentAttackInfo.index];
		this._updateVisuals(frameData);

		this.checkTileBasedCollision();
	}

	/**
	 * Hides the Attack and disables the hit-detection.
	 */
	hide() {
		this.setCollidable(false);
		this.visible = false;
		this.active = false;
	}

	/**
	 * Sets all internal values to play the given Attack type, aimed in the given
	 * direction.
	 * @param {AttackType} type the attack type which should be displayed
	 * @param {string} dir the direction in which the attack is aimed
	 */
	reset(type, dir) {
		dir = dir || "down";
		this._currentAttackInfo = {frames: type.allFrames[dir], index: 0};

		// TODO: Set the damage stats of the Attack class to the  one defined on the Attack-Type

		this._updateVisuals(this._currentAttackInfo.frames[0]);

		// reminder: also enables the debug rendering of the hitbox
		this.setCollidable(true);

		this.visible = true;

		this.active = true;

		this.checkTileBasedCollision();
	}

	/**
	 * Sets the given key-frame definition.
	 * Updates the hitbox position and the Sprites.
	 * @param {object} frameData a frame data object from the "allFrames" map
	 */
	_updateVisuals(frameData) {
		if (frameData) {
			this.x = this.player.x;
			this.y = this.player.y;
			this.updateHitbox(frameData.hitbox);

			this.configSprite(frameData.sprite);
		}
	}

	/**
	 * Checks if the Attack collides with a destructible tile.
	 * If so the tile is destroyed and a small effect is shown.
	 */
	checkTileBasedCollision() {
		let tile = this.getClosestTile();

		if (tile) {
			// might not do something, depending on the tile
			tile.destroy();
		} else {
			// happened before... could not find out why :(
			// eslint-disable-next-line no-debugger
			debugger;
		}
	}
}

export default Attack;