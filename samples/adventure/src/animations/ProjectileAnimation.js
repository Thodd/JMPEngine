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
			sheet: "items",
			id: 47
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
	setProjectileType() {
		// TODO: implement specific sprites for each projectile -> rotate
	}

	/**
	 * Defines the start- and end-point of the ProjectileAnimation.
	 *
	 * @param {GameTile} startTile the tile from which the animation should start
	 * @param {GameTile} goalTile the tile on which the animation should end
	 */
	moveFromTo(startTile, goalTile) {
		this.startX = startTile.x * Constants.TILE_WIDTH;
		this.startY = startTile.y * Constants.TILE_HEIGHT;
		this.goalX = goalTile.x * Constants.TILE_WIDTH;
		this.goalY = goalTile.y * Constants.TILE_HEIGHT;

		this._projectile.x = this.startX;
		this._projectile.y = this.startY;
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