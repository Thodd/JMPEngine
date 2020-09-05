import Entity from "../../../../src/game/Entity.js";

import Constants from "../Constants.js";

class Actor extends Entity {
	constructor(x, y) {
		super(x, y);

		// looking direction
		this.dir = "down";
	}

	/**
	 * Gets the closest Tile to this actor's hitbox origin (x,y).
	 * The parameters dy and dy can be used to shift the origin.
	 * By default the center of the hitbox is taken.
	 * So if you leave dx and dy empty, they default to half the hitbox width/height.
	 *
	 * @param {int} [dy=undefined] delta on the x axis
	 * @param {int} [dy=undefined] delta on the y axis
	 * @returns {GameTile|undefined} returns either the GameTile instance closest to this actor,
	 *                               or undefined if the actor is not added to a screen,
	 *                               or the actor is placed outside the range of the Tilemap.
	 */
	getClosestTile(dx, dy) {
		let screen = this.getScreen();
		if (screen) {
			dx = dx != undefined ? dx : Math.round(this._hitbox.w/2);
			dy = dy != undefined ? dy : Math.round(this._hitbox.h/2);

			let tm = screen.getTilemap();

			let w = Constants.TILE_WIDTH;
			let h = Constants.TILE_HEIGHT;

			let x = this.x + this._hitbox.x + dx;
			let y = this.y + this._hitbox.y + dy;

			return tm.get(Math.floor(x / w), Math.floor(y / h));
		}
	}
}

export default Actor;