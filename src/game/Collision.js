import { warn } from "../utils/Log.js";

function checkTilemapCollision(e1, e2, x, y) {
	// figure out which entity is a Tilemap
	let e = e1._isTilemap ? e2 : e1;
	let t = e1._isTilemap ? e1 : e2;

	let w = t._tileWidth;
	let h = t._tileHeight;

	// why -1 on right and bottom?
	// because otherwise the width/height of the hitbox would (correctly) end up in a different Tile
	// for the grid collision the width/height of the hitbox is counted in pixels, the offset of the
	// hit box being the first pixel to count (basically starting from 0)
	let left = x + e._hitbox.x;
	let right = x + e._hitbox.x + e._hitbox.w - 1;
	let top = y + e._hitbox.y;
	let bottom = y + e._hitbox.y + e._hitbox.h - 1;

	let dummyTile = {isBlocking: false};

	let tileTopRight = t.get(Math.floor(right / w), Math.floor(top / h)) || dummyTile;
	let tileTopLeft = t.get(Math.floor(left / w), Math.floor(top / h)) || dummyTile;

	let collideX = tileTopRight.isBlocking ||
					tileTopLeft.isBlocking;

	let tileBottomRight = t.get(Math.floor(right / w), Math.floor(bottom / h)) || dummyTile;
	let tileBottomLeft = t.get(Math.floor(left / w), Math.floor(bottom / h)) || dummyTile;

	let collideY = tileBottomRight.isBlocking ||
					tileBottomLeft.isBlocking;

	return collideX || collideY;

}

export default {
	/**
	 * Checks if Entity e1 collides with Entity e2.
	 * @param {Entity} e1
	 * @param {Entity} e2
	 * @returns {boolean} whether a collision occurred or not
	 */
	check: function (e1, e2) {
		return this.checkAtPosition(e1, e2, e1.x, e1.y);
	},

	/**
	 * Checks if entity1 collides with entity2 when placing e1 at (x, y).
	 * @param {Entity} e1
	 * @param {Entity} e2
	 * @param {int} x
	 * @param {int} y
	 * @returns {boolean} whether a collision occurred or not
	 */
	checkAtPosition: function (e1, e2, x, y) {
		// at least one entity is not collidable so we can quickly mark this check as false
		if (!e1._hitbox._collidable || !e2._hitbox._collidable) {
			return false;
		}

		// check for tilemap based collision
		if (e1._isTilemap && e2._isTilemap) {
			warn("Two Tilemaps cannot be checked for collision against eachother.", "Collision");
			return false;
		} else if (e1._isTilemap || e2._isTilemap) {
			return checkTilemapCollision(e1, e2, x, y);
		}

		// entity1 is placed at (x, y), it is the entity performing the check
		let x1 = x + e1._hitbox.x;
		let y1 = y + e1._hitbox.y;

		// entity2 is not offsetted, but still the hitbox offset is regarded
		let x2 = e2.x + e2._hitbox.x;
		let y2 = e2.y + e2._hitbox.y;

		if (x1 < x2 + e2._hitbox.w &&
			x1 + e1._hitbox.w > x2 &&
			y1 < y2 + e2._hitbox.h &&
			y1 + e1._hitbox.h > y2) {
				return true;
		}
		return false;
	}
};