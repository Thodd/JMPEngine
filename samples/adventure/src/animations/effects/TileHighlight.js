import BaseEffect from "./BaseEffect.js";

class TileHighlight extends BaseEffect {
	constructor() {
		super();

		this.configSprite({
			sheet: "tile_highlights",
			animations: {
				default: "idle",
				idle: {
					frames: [10, 11],
					dt: 60
				}
			}
		});
	}

	reset() {

	}
}

export default TileHighlight;