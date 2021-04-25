import Constants from "../../Constants.js";
import BaseEffect from "./BaseEffect.js";

class TileHighlight extends BaseEffect {
	constructor() {
		super();

		this.layer = Constants.Layers.ABOVE_ACTORS;

		this.configSprite({
			sheet: "tile_effects",
			id: 10,
			color: Constants.Colors.YELLOW_LIGHT
		});
	}


	set(style) {
		this.configSprite({
			sheet: "tile_effects",
			id: 10,
			color: style
		});
	}

	reset() {}
}

export default TileHighlight;