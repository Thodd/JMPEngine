export default {
	/**
	 * Checks if Entity e1 collides with Entity e2.
	 * @param {Entity} e1
	 * @param {Entity} e2
	 */
	check: function (e1, e2) {
		return this.checkAtPosition(e1, e2, e1.x, e1.y);
	},

	/**
	 * Checks if entity1 collides with entity2 when placing e1 at (x, y)
	 * @param {Entity} e1
	 * @param {Entity} e2
	 * @param {int} x
	 * @param {int} y
	 */
	checkAtPosition: function (e1, e2, x, y) {
		// entity1 is placed at (x, y), it is the entity performing the check
		var iX1 = x + e1.hitbox.x;
		var iY1 = y + e1.hitbox.y;

		// entity2 is not offsetted, but still the hitbox offset is regarded
		var iX2 = e2.x + e2.hitbox.x;
		var iY2 = e2.y + e2.hitbox.y;

		if (iX1 < iX2 + e2.hitbox.w &&
			iX1 + e1.hitbox.w > iX2 &&
			iY1 < iY2 + e2.hitbox.h &&
			iY1 + e1.hitbox.h > iY2) {
				return true;
		}
		return false;
	}
};