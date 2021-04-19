import Constants from "../../Constants.js";
import BaseEffect from "./BaseEffect.js";

class TileHighlight extends BaseEffect {
	constructor() {
		super();

		this.layer = Constants.Layers.ABOVE_ACTORS;

		this.configSprite({
			sheet: "tile_effects",
			id: TileHighlight.CURSOR_ORANGE
		});
	}


	set(style) {
		this.configSprite({
			sheet: "tile_effects",
			id: style
		});
	}

	reset() {}
}

// tile constants
TileHighlight.CURSOR_RED = 31;
TileHighlight.CURSOR_ORANGE = 32;
TileHighlight.CURSOR_GREEN_DARK = 33;
TileHighlight.CURSOR_GREEN_LIGHT = 34;
TileHighlight.CURSOR_BLUE = 35;

export default TileHighlight;