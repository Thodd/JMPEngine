import { warn } from "../utils/Log.js";

const dummyTile = {isBlocking: false};

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
	 * Checks if entity1 collides with entity2 when e1 is placed at (x, y).
	 * Useful if you want to precheck if a position is free before moving an Entity.
	 *
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
			return this._checkTilemapCollision(e1, e2, x, y);
		}

		// compare hitboxes against each other
		return this._checkHitboxOverlap(x, y, e2.x, e2.y, e1._hitbox, e2._hitbox);
	},

	/**
	 * Checks the given Entity against the given Tilemap.
	 *
	 * @param {Entity|Tilemap} e1 Entity or Eilemap instance 1
	 * @param {Entity|Tilemap} e2 Entity or Tilemap instance 2
	 * @param {int} x x position of the Entity
	 * @param {int} y y position of the Entity
	 */
	_checkTilemapCollision(e1, e2, x, y) {
		// figure out which entity is a Tilemap
		let e = e1._isTilemap ? e2 : e1;
		let t = e1._isTilemap ? e1 : e2;

		let w = t._tileWidth;
		let h = t._tileHeight;

		// Why -1 on right and bottom?
		// Because otherwise the width/height of the hitbox would (incorrectly) end up in a different Tile.
		// for the grid collision the width/height of the hitbox is counted in pixels, the offset of the
		// hitbox being the first pixel to count (basically starting from 0).
		let left = x + e._hitbox.x;
		let right = x + e._hitbox.x + e._hitbox.w - 1;
		let top = y + e._hitbox.y;
		let bottom = y + e._hitbox.y + e._hitbox.h - 1;

		let tileTopRight = t.get(Math.floor(right / w), Math.floor(top / h)) || dummyTile;
		let tileTopLeft = t.get(Math.floor(left / w), Math.floor(top / h)) || dummyTile;

		let tileBottomRight = t.get(Math.floor(right / w), Math.floor(bottom / h)) || dummyTile;
		let tileBottomLeft = t.get(Math.floor(left / w), Math.floor(bottom / h)) || dummyTile;

		let collideX = tileTopRight.isBlocking || tileTopLeft.isBlocking;
		let collideY = tileBottomRight.isBlocking || tileBottomLeft.isBlocking;

		// the tiles might have a hitbox assigned
		if (!collideX && !collideY) {

			return this._checkTileHitboxes(x, y, tileTopLeft, e) || this._checkTileHitboxes(x, y, tileTopRight, e) || this._checkTileHitboxes(x, y, tileBottomLeft, e) || this._checkTileHitboxes(x, y, tileBottomRight, e);

		}

		return collideX || collideY;
	},

	_checkTileHitboxes(x, y, tile, e) {
		if (tile._hitbox) {
			// make sure the hitbox property is an array, allows for multiple hitboxes on one tile :)
			if (!Array.isArray(tile._hitbox)) {
				tile._hitbox = [tile._hitbox];
			}
			for (let i = 0; i < tile._hitbox.length; i++) {
				if (this._checkHitboxOverlap(x,y,tile.screenX,tile.screenY, e._hitbox, tile._hitbox[i])) {
					return true;
				}
			}
		}

		return false;
	},

	/**
	 *
	 * @param {int} e1x the X position of entity 1
	 * @param {int} e1y the Y position of entity 1
	 * @param {int} e2x the X position of entity 2
	 * @param {int} e2y the Y position of entity 2
	 * @param {Hitbox} hb1 the hitbox of entity 1
	 * @param {Hitbox} hb2 the hitbox of entity 2
	 */
	_checkHitboxOverlap(e1x, e1y, e2x, e2y, hb1, hb2) {
		// entity1 is placed at (x, y), it is the entity performing the check
		let x1 = e1x + hb1.x;
		let y1 = e1y + hb1.y;

		// entity2 is not offsetted, but still the hitbox offset is regarded
		let x2 = e2x + hb2.x;
		let y2 = e2y + hb2.y;

		if (x1 < x2 + hb2.w &&
			x1 + hb1.w > x2 &&
			y1 < y2 + hb2.h &&
			y1 + hb1.h > y2) {
				return true;
		}
		return false;
	}
};