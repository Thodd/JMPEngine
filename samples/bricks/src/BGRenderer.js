import Tilemap from "../../../src/game/Tilemap.js";

import Score from "./Score.js";

/**
 * BG Effects are based on the current level
 */
const bgEffectTable = {
	0: {
		color: 0x0085FF
	},
	3: {
		color: 0x85FF00
	},
	5: {
		color: 0x8500FF
	},
	7: {
		color: 0xFF8500
	},
	10: {
		color: 0xFF0085
	},
	13: {
		color: 0x85FF00
	},
	16: {
		color: 0xFFFFFF
	}
};

/*
	We render the tilemap with doubled width and height.
	This way we can simply move it around without creating seams or gaps.

	(0,0)--------16-------(256,0)--------16------(512,0)
	  |                      |                      |
	 12                      |                      |
	  |                      |                      |
	(0,192)---------------(256,192)--------------(512,192)
	  |                      |                      |
	 12                      |                      |
	  |                      |                      |
	(0,384)---------------(256,384)--------------(512,384)
*/
class BGRenderer extends Tilemap {
	constructor() {
		super({sheet: "BG", w: 32, h: 24});

		this.each((t) => {
			t.set(0);

			for (let c in bgEffectTable) {
				if (Score.level > c) {
					t.setColor(bgEffectTable[c].color);
				}
			}

		});
	}

	update() {
		// change BG color if a certain level is reached
		if (bgEffectTable[Score.level]) {
			this.each((t) => {
				t.setColor(bgEffectTable[Score.level].color);
			});
		}

		// increase speed based on the current level (min. 0.3 for half-decent smoothness ;)
		this._speed = 0.1 * Score.level;

		this.x -= this._speed;
		this.y -= this._speed;

		if (this.x <= -256 || this.y <= -192) {
			this.x = 0;
			this.y = 0;
		}

	}
}

export default BGRenderer;