// jmp imports
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

// own imports
import Constants from "./Constants.js";
import Entity from "../../../src/game/Entity.js";
import Bullet from "./effects/Bullet.js";

class Ship extends Entity {
	constructor() {
		super();

		this.canShoot = true;

		// visuals
		this.layer = Constants.Layers.PLAYER;

		this.configSprite({
			sheet: "ship",
			id: 0
		});

		// collision detection
		if (Constants.DEBUG) {
			this.RENDER_HITBOX = 0xFF0085;
		}
		this.updateHitbox({
			x: 4,
			y: 4,
			w: 8,
			h: 8
		});
	}

	added() {
		// initial position in the middle of the screen
		this.x = this.getScreen().getWidth() / 2 - 4;
		this.y = this.getScreen().getHeight() - 16;
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

		if (Keyboard.down(Keys.S) && this.canShoot) {
			let myScreen = this.getScreen();

			// reseting shooting delay
			this.canShoot = false;
			myScreen.registerFrameEvent(() => {
				this.canShoot = true;
			}, 5);

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