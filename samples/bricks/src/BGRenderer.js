import Tilemap2 from "../../../src/game/Tilemap2.js";

/*
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
class BGRenderer extends Tilemap2 {
	constructor() {
		super("BG", 32, 24);

		this.each((t) => {
			t.set(0);
		});
	}

	update() {
		this.x -= 0.3;
		this.y -= 0.3;

		if (this.x <= -256 || this.y <= -192) {
			this.x = 0;
			this.y = 0;
		}
	}
}

export default BGRenderer;