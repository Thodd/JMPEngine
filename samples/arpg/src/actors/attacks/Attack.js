import Actor from "../Actor.js";
import Tileset from "../../mapgen/Tileset.js";
import TileTypes from "../../mapgen/TileTypes.js";
import SmallEffect from "../effects/SmallEffect.js";

/**
 * Defines the basic lifecycle of Attacks.
 * Synchronized via the Player animations.
 * Each key-frame updates the (melee) attack animations.
 * @abstract
 */
class Attack extends Actor {
	constructor(player) {
		super();
		this.player = player;

		this.active = false;

		this.RENDER_HITBOX = 0x0085FF;

		this.updateHitbox({
			w: 18,
			h: 18
		});

		this.configSprite({
			sheet: "attacks",
			id: 15
		});

		this.setCollidable(false);
	}

	update() {
		let collidingEnemies = this.collidesWithTypes(["enemy"], true);
		if (collidingEnemies) {
			collidingEnemies.forEach((enemy) => {
				// TODO: Change damage based on Player Weapon
				enemy.takeDamage(1, this);
			});
		}
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
			this.x = this.player.x + frameData.hitbox.x;
			this.y = this.player.y + frameData.hitbox.y;
			this.configSprite(frameData.sprite);
		}
	}

	/**
	 * Checks if the Attack collides with a destructible tile.
	 * If so the tile is destroyed and a small effect is shown.
	 */
	checkTileBasedCollision() {
		let tile = this.getClosestTile();
		let showEffect = false;

		// replace tile with it's "destroyed/cut" counter part
		if (tile.type === TileTypes.GRASS || tile.type === TileTypes.BUSH) {
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

export default Attack;