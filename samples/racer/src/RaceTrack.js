import Manifest from "../../../src/Manifest.js";
import Screen from "../../../src/game/Screen.js";
import GFX from "../../../src/gfx/GFX.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Text from "../../../src/gfx/Text.js";

class RaceTrack extends Screen {
	constructor() {
		super();
	}

	setup() {
		GFX.getBuffer(0).setClearColor("#332c50");
		GFX.getBuffer(0).setRenderMode(Buffer.RenderModes.RAW);
	}

	update() {

	}
}

export default RaceTrack;