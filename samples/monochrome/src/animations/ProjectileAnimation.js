import BaseAnimation from "./BaseAnimation.js";
import Constants from "../Constants.js";
import Entity from "../../../../src/game/Entity.js";

class ProjectileAnimation extends BaseAnimation {
	constructor() {
		super();

		// the speed is arbitrary, just looks good at half a tile-width/height
		this.speed = 5;

		this._projectile = new Entity();
		this._projectile.configSprite({
			sheet: "projectiles",
			id: 24
		});

		// projectile entity is only a visual effect, no game logic
		this._projectile.active = false;
	}

	reset() {
		super.reset();

		// we don't remove the projectile from the screen since its used multiple times anyway
		if (this._projectile.getScreen() == null) {
			this.actor.getScreen().add(this._projectile);
		}
	}

	/**
	 * Defines which type of projectile is rendered.
	 */
	_setProjectileType(type=Constants.ProjectileTypes.BULLET) {
		let spriteID = 0;
		let spritesheetOffsetY;

		switch (type) {
			case Constants.ProjectileTypes.JAVELIN:
				spritesheetOffsetY = 0;
				break;
			case Constants.ProjectileTypes.ARROW:
				spritesheetOffsetY = 8;
				break;
			case Constants.ProjectileTypes.THROWING_KNIFES:
				spritesheetOffsetY = 16;
				break;
			case Constants.ProjectileTypes.BULLET:
				spritesheetOffsetY = 24;
				break;
		}

		let x = this.startX - this.goalX;
		let y = this.startY - this.goalY;
		let deg = Math.atan2(y, x) / Math.PI * 180; //atan2 is in rad!
		if (deg < 0) {
			deg += 360;
		}

		// TODO: hard-codeded mapping of sprites for each angle-range e.g. 0 to 45, 45 to 90, ... to 360
		if (deg < 45) {
			spriteID = 0;
		} else if (deg < 90) {
			spriteID = 1;
		} else if (deg < 135) {
			spriteID = 2;
		} else if (deg < 180) {
			spriteID = 3;
		} else if (deg < 225) {
			spriteID = 4;
		} else if (deg < 270) {
			spriteID = 5;
		} else if (deg < 315) {
			spriteID = 6;
		} else if (deg < 360) {
			spriteID = 7;
		}

		// add the offset based on the projectile type
		spriteID += spritesheetOffsetY;

		this._projectile.configSprite({
			sheet: "projectiles",
			id: spriteID
		});
	}

	/**
	 * Defines the start- and end-point of the ProjectileAnimation.
	 *
	 * @param {GameTile} startTile the tile from which the animation should start
	 * @param {GameTile} goalTile the tile on which the animation should end
	 */
	moveFromTo(startTile, goalTile, type=Constants.ProjectileTypes.BULLET) {
		this.startX = startTile.x * Constants.TILE_WIDTH;
		this.startY = startTile.y * Constants.TILE_HEIGHT;
		this.goalX = goalTile.x * Constants.TILE_WIDTH;
		this.goalY = goalTile.y * Constants.TILE_HEIGHT;

		this._projectile.x = this.startX;
		this._projectile.y = this.startY;

		this._setProjectileType(type);
	}

	animate() {
		this._projectile.visible = true;

		let dx = this.goalX - this._projectile.x;
		let dy = this.goalY - this._projectile.y;
		let distance = Math.sqrt(dx * dx + dy * dy);

		// stop when we cannot make a full step towards the goal anymore
		if (distance <= this.speed) {
			this.done();
		} else {
			this._projectile.x += (dx / distance) * this.speed;
			this._projectile.y += (dy / distance) * this.speed;
		}
	}

	done() {
		super.done();
		this._projectile.visible = false;
	}
}

export default ProjectileAnimation;