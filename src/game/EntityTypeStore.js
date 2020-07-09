/**
 * Tracks the entities with respect to their types.
 * Used for fast access during collision detection.
 * Only one instance per Screen!
 *
 * @private
 */
class EntityTypeStore {
	constructor() {
		this._typeMap = new Map();
	}

	add(e) {
		// add entity to all type sets
		if (e._types) {
			e._types.forEach((t) => {
				let entities = this._typeMap.get(t);
				if (!entities) {
					entities = new Set();
					this._typeMap.set(t, entities);
				}

				entities.add(e);
			});
		}
	}

	remove(e, oldTypes) {
		// add entity to all type sets
		if (oldTypes) {
			oldTypes.forEach((t) => {
				let entities = this._typeMap.get(t);
				if (entities) {
					entities.delete(e);
				}
			});
		}
	}

	getEntitySet(type) {
		return this._typeMap.get(type);
	}
}

export default EntityTypeStore;