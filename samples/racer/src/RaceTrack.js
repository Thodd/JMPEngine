import Manifest from "../../../src/Manifest.js";
import Screen from "../../../src/game/Screen.js";
import GFX from "../../../src/gfx/GFX.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Text from "../../../src/gfx/Text.js";
import Engine from "../../../src/Engine.js";

class RaceTrack extends Screen {
	constructor() {
		super();
	}

	setup() {
		GFX.getBuffer(0).setClearColor("#332c50");
		//GFX.getBuffer(0).setRenderMode(Buffer.RenderModes.RAW);
	}

	update() {

	}

	render() {
		for (let i = 0; i < 1; i++) {
			GFX.get(0).trif(10+Engine.now()*100, 10, 100, 100, 5, 70, "#FFFFFF");
		}
	}
}

export default RaceTrack;