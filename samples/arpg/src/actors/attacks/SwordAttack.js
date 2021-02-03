import Actor from "../Actor.js";
import Tileset from "../../mapgen/Tileset.js";
import TileTypes from "../../mapgen/TileTypes.js";
import SmallEffect from "../effects/SmallEffect.js";

/**
 * Key-Frame definitions for Sword slashing animation.
 * Also tracks the positioning of the hitbox for damaging enemies etc.
 */
const allFrames = {
	up: [
		{
			sprite: {sheet: "attacks", id: 4},
			hitbox: { x:  16, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 2, offset: {x: -3, y: +2}},
			hitbox: { x:  16, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 1, offset: {x: -4}},
			hitbox: { x:   0, y: -16 }
		}
	],
	down: [
		{
			sprite: {sheet: "attacks", id: 3},
			hitbox: { x: -16, y:   0 }
		},
		{
			sprite: {sheet: "attacks", id: 5, offset: {x: +4, y: -2}},
			hitbox: { x: -16, y:  16 }
		},
		{
			sprite: {sheet: "attacks", id: 6, offset: {x: +4, y: +1}},
			hitbox: { x:   0, y:  16 }
		}
	],
	left: [
		{
			sprite: {sheet: "attacks", id: 1},
			hitbox: { x:   0, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 0, offset: {x: 0, y: +3}},
			hitbox: { x: -16, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 3, offset: {x: 0, y: +2}},
			hitbox: { x: -18, y:   0 }
		}
	],
	right: [
		{
			sprite: {sheet: "attacks", id: 8},
			hitbox: { x:   0, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 7, offset: {x: -1, y: +3}},
			hitbox: { x: +16, y: -16 }
		},
		{
			sprite: {sheet: "attacks", id: 9, offset: {x: +2, y: +2}},
			hitbox: { x:  16, y:   0 }
		}
	]
};

/**
 * Implements the Sword-Slashing Animation.
 * The timing of the Sword animation is synchronized by the Player animation.
 * This way the Attacks don't rely on a separate timing, but are controlled by the Player's sprite animation.
 */
class SwordAttack extends Actor {
	constructor(player) {
		super();
		this.player = player;

		this.active = false;

		this.updateHitbox({
			w: 18,
			h: 18
		});

		/**
		 *
		 * TODO: Store sprite config per position: {id: 0, offset: {x: -4, y: 2}} etc.
		 *
		 */

		this.configSprite({
			sheet: "attacks",
			id: 15
		});

		this.cfg = {frames: allFrames.down, index: 0};

		this.setCollidable(false);
	}

	next() {
		if (this.cfg.index < 3) {
			this.cfg.index++;
		} else {
			this.cfg.index = 0;
		}

		let frameData = this.cfg.frames[this.cfg.index];
		this._updateVisuals(frameData);

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

	reset(dir) {
		this.cfg = {
			frames: allFrames[dir],
			index: 0
		};

		this._updateVisuals(this.cfg.frames[0]);

		// reminder: also enables the debug rendering of the hitbox
		this.setCollidable(true);

		this.visible = true;

		this.checkTileBasedCollision();
	}

	hide() {
		this.setCollidable(false);
		this.visible = false;
	}

	checkTileBasedCollision() {
		let tile = this.getClosestTile();
		let showEffect = false;

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

export default SwordAttack;