// core imports
import RLActor from "../../core/RLActor.js";

class ItemBase extends RLActor {
	constructor(type) {
		super();
		this._type = type;

		// Other actors can walk over Items
		this.walkable = true;

		// define visuals
		this.id = type.visuals.id;
		this.color = type.visuals.color;
		this.background = type.visuals.background;
	}

	getType() {
		return this._type;
	}
}

export default ItemBase;