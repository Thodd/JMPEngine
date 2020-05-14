import Screen from "../../../src/game/Screen.js";
import GFX from "../../../src/gfx/GFX.js";
import Text from "../../../src/gfx/Text.js";
import Manifest from "../../../src/Manifest.js";

class MenuScreen extends Screen {
	constructor() {
		super();

		this.createTexts();
	}

	setup() {
		GFX.getBuffer(0).setClearColor("#332c50");
	}

	createTexts() {
		let msg =
`
RenderMode: BASIC

RenderMode: RAW
`;
		let t = new Text({
			x: 20,
			y: Manifest.get("/h") / 2 - 25,
			text: msg,
			leading: 2,
			useKerning: true,
			color: "#FF0085"
		});
		this.add(t);
	}
}

export default MenuScreen;