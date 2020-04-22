import Entity from "../../../src/game/Entity.js";
import GFX from "../../../src/gfx/GFX.js";

class BGRenderer extends Entity {
	constructor(x, y) {
		super(x, y);

		this.parts = [
			{x: 0, y:0},
			{x: 256, y:0},
			{x: 0, y:192},
			{x: 256, y:192}
		];
	}

	update() {
		this.parts.forEach((p) => {
			p.x -= 0.3;
			p.y -= 0.3;

			if ((p.x + 256) <= 0) {
				p.x = 256;
			}
			if ((p.y + 192) <= 0) {
				p.y = 192;
			}
		});
	}

	render() {
		this.parts.forEach((p) => {
			GFX.spr("BG", 0, p.x, p.y, 0);
		});
	}
}

export default BGRenderer;