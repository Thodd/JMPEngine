import BaseAnimation from "./BaseAnimation.js";
import Constants from "../Constants.js";

class MovementAnimation extends BaseAnimation {
	reset() {
		super.reset();
		this.speed = 1;
		this.startX = 0;
		this.startY = 0;
		this.goalX = 0;
		this.goalY = 0;
		this.dx = 0;
		this.dy = 0;
	}

	/**
	 * Sets the values for this MovementAnimation from the Actor's current GameTile to the given goal GameTile.
	 * @param {GameTile} goalTile the GameTile on which the animation should end
	 */
	moveTo(goalTile) {
		this.moveFromTo(this.actor.getTile(), goalTile);
	}

	/**
	 * Sets the values for this MovementAnimation from the given start GameTile to the given goal GameTile
	 * @param {GameTile} startTile start GameTile from which the animation should begin
	 * @param {GameTile} goalTile the GameTile on which the animation should end
	 */
	moveFromTo(startTile, goalTile) {
		this.setValues(
			startTile.x * Constants.TILE_WIDTH, startTile.y * Constants.TILE_HEIGHT,
			goalTile.x * Constants.TILE_WIDTH, goalTile.y * Constants.TILE_HEIGHT
		);
	}

	/**
	 * Sets the values for this MovementAnimation from a start x/y position (in pixels)
	 * to a goal x/y position (in pixels).
	 * @param {int} startX X coordinate start value (in pixels)
	 * @param {*} startY Y coordinate start value (in pixels)
	 * @param {*} goalX X coordinate goal value (in pixels)
	 * @param {*} goalY Y coordinate goal value (in pixels)
	 */
	setValues(startX, startY, goalX, goalY) {
		this.startX = startX;
		this.startY = startY;

		// move Actor GFX to the animation start
		this.actor.x = startX;
		this.actor.y = startY;

		this.goalX  = goalX;
		this.goalY  = goalY;

		// TODO: Calculate slope correctly (dx/dy is != 1 or 0)!!
		this.dx = Math.sign(goalX - startX);
		this.dy = Math.sign(goalY - startY);

		// nothing to animate!
		// we need to detect this situation, otherwise we block the animation system
		if (this.dx == 0 && this.dy == 0) {
			this.done();
		}
	}

	animate() {
		if (this.actor.x != this.goalX) {
			this.actor.x += this.speed * this.dx;
		}
		if (this.actor.y != this.goalY) {
			this.actor.y += this.speed * this.dy;
		}

		// We update the Camera to center around the player only when moving the player.
		// If we were to do this in the update() loop of the player, the screen would constantly shake during BumpAnimations.
		if (this.actor.isPlayer && !this.actor.isDead) {
			this.actor.centerCamera();
		}

		// TODO: Handle (slope != 0 or 1) correctly
		if (this.actor.x == this.goalX && this.actor.y == this.goalY) {
			this.done();
		}
	}
}

export default MovementAnimation;