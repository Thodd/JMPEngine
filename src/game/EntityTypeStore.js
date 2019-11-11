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

	remove(e) {
		// add entity to all type sets
		if (e._types) {
			e._types.forEach((t) => {
				let entities = this._typeMap.get(t);
				if (entities) {
					entities.delete(e);
				}
			});
		}
	}
}

export default EntityTypeStore;