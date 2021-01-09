import Constants from "../../Constants.js";
import BaseEffect from "./BaseEffect.js";

class TileHighlight extends BaseEffect {
	constructor() {
		super();

		this.layer = Constants.Layers.ABOVE_ACTORS;

		this.configSprite({
			sheet: "tile_highlights",
			id: 10
		});
	}

	reset() {}
}

export default TileHighlight;