import Manifest from "../../../src/assets/Manifest.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

import Constants from "./Constants.js";
import Entity from "../../../src/game/Entity.js";
import Bullet from "./effects/Bullet.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";

class Ship extends Entity {
	constructor() {
		super();

		this.layer = Constants.Layers.PLAYER;

		this.configSprite({
			sheet: "ship",
			id: 0
		});

		if (Constants.DEBUG) {
			this.RENDER_HITBOX = 0xFF0085;
		}
		this.updateHitbox({
			x: 4,
			y: 4,
			w: 8,
			h: 8
		});

		this.x = Manifest.get("/w") / 2 - 4;
		this.y = Manifest.get("/h") - 16;
	}

	update() {
		if (Keyboard.down(Keys.LEFT)) {
			this.x-=1;
		} else if (Keyboard.down(Keys.RIGHT)) {
			this.x+=1;
		}

		if (Keyboard.down(Keys.UP)) {
			this.y-=1;
		} else if (Keyboard.down(Keys.DOWN)) {
			this.y+=1;
		}

		if (Keyboard.down(Keys.S)) {
			let myScreen = this.getScreen();

			this.canShoot = false;

			// TODO: implement frame-events
			let i = myScreen.registerFrameEventOnce(5, function() {
				this.canShoot = true;
			}.bind(this));

			// screen.registerFrameEventInterval(5, function() {

			// });

			// screen.cancelFrameEvent(i);

			// get a projectile instance from the Bullet pool
			let bl = Bullet.get(Bullet.Types.LASER, myScreen);
			bl.x = this.x-4;
			bl.y = this.y;

			let br = Bullet.get(Bullet.Types.LASER, myScreen);
			br.x = this.x+4;
			br.y = this.y;
		}
	}
}

export default Ship;