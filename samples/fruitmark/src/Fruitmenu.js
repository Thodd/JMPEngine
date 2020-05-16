import Screen from "../../../src/game/Screen.js";
import GFX from "../../../src/gfx/GFX.js";
import Text from "../../../src/gfx/Text.js";
import Manifest from "../../../src/Manifest.js";
import Engine from "../../../src/Engine.js";
import Fruitmark from "./Fruitmark.js";
import Buffer from "../../../src/gfx/Buffer.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import Scope from "./Scope.js";
class Fruitmenu extends Screen {
	constructor() {
		super();

		// keep a reference in the Scope, so we can reuse it from the Fruitmark screen
		Scope.menuScreen = this;

		this.currentOption = 0;

		this.options = [
			{
				title: "RenderMode: BASIC_60  ( 1000)",
				renderMode: Buffer.RenderModes.BASIC,
				entityCount: 1000,
				fps: 60
			},
			{
				title: "RenderMode: BASIC_60  ( 2000)",
				renderMode: Buffer.RenderModes.BASIC,
				entityCount: 2000,
				fps: 60
			},
			{
				title: "RenderMode: BASIC_60  ( 5000)",
				renderMode: Buffer.RenderModes.BASIC,
				entityCount: 5000,
				fps: 60
			},
			{
				title: "RenderMode: RAW_60    ( 1000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 1000,
				fps: 60
			},
			{
				title: "RenderMode: RAW_60    ( 2000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 2000,
				fps: 60
			},
			{
				title: "RenderMode: RAW_60    ( 5000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 5000,
				fps: 60
			},
			{
				title: "RenderMode: RAW_60    (10000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 10000,
				fps: 60
			},
			{
				title: "RenderMode: BASIC_30  ( 1000)",
				renderMode: Buffer.RenderModes.BASIC,
				entityCount: 1000,
				fps: 30
			},
			{
				title: "RenderMode: BASIC_30  ( 2000)",
				renderMode: Buffer.RenderModes.BASIC,
				entityCount: 2000,
				fps: 30
			},
			{
				title: "RenderMode: BASIC_30  ( 5000)",
				renderMode: Buffer.RenderModes.BASIC,
				entityCount: 5000,
				fps: 30
			},
			{
				title: "RenderMode: RAW_30    ( 1000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 1000,
				fps: 30
			},
			{
				title: "RenderMode: RAW_30    ( 2000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 2000,
				fps: 30
			},
			{
				title: "RenderMode: RAW_30    ( 5000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 5000,
				fps: 30
			},
			{
				title: "RenderMode: RAW_30    (10000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 10000,
				fps: 30
			},
			{
				title: "RenderMode: RAW_30    (20000)",
				renderMode: Buffer.RenderModes.RAW,
				entityCount: 20000,
				fps: 30
			}
		];

		this.yOffset = Math.round((Manifest.get("/h") - this.options.length * 15) / 2);

		this.createTexts();
	}

	setup() {
		GFX.getBuffer(0).setClearColor("#332c50");
	}

	createTexts() {
		this.options.forEach((o, i) => {
			let t = new Text({
				x: 30,
				y: this.yOffset + i * 15,
				text: o.title,
				leading: 2,
				useKerning: true,
				color: "#FF0085"
			});
			t.layer = 1;
			this.add(t);
		});
	}

	update() {
		if (Keyboard.pressed(Keys.DOWN)) {
			this.currentOption += 1;
		} else if (Keyboard.pressed(Keys.UP)) {
			this.currentOption -= 1;
		}

		if (Keyboard.pressed(Keys.ENTER)) {
			let opt = this.options[this.currentOption];

			if (!Scope.fruitmarkScreen) {
				Scope.fruitmarkScreen = new Fruitmark();
			}
			Scope.fruitmarkScreen.init(opt.renderMode, opt.entityCount, opt.fps);

			Engine.screen = Scope.fruitmarkScreen;
			return;
		}

		if (this.currentOption < 0) {
			this.currentOption = this.options.length-1;
		} else if (this.currentOption >= this.options.length) {
			this.currentOption = 0;
		}
	}

	render() {
		GFX.get(0).rectf(25, this.yOffset + this.currentOption * 15 - 3, 210, 13, "#FFFFFF");
	}
}

export default Fruitmenu;