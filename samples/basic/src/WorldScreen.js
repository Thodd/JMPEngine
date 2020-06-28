import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import Keyboard from "../../../src/input/Keyboard.js";
import Keys from "../../../src/input/Keys.js";

class WorldScreen extends Screen {
	constructor() {
		super();

		/*let e = new Entity();
		e.setSprite({
			sheet: "player",
			id: 0
		});

		this.add(e);

		e.update = function () {
			if (Keyboard.down(Keys.DOWN)) {
				this.y++;
			} else if (Keyboard.down(Keys.UP)) {
				this.y--;
			}
			if (Keyboard.down(Keys.LEFT)) {
				this.x--;
			} else if (Keyboard.down(Keys.RIGHT)) {
				this.x++;
			}
		}*/

		let w = this.getWidth();
		let h = this.getHeight();

		for (let i = 0; i < 10000; i++) {
			let e = new Entity();
			e.setSprite({
				sheet: "player",
				id: 0,
				pixiConfig: {}
			});
			e.x = Math.floor(Math.random() * w);
			e.y = Math.floor(Math.random() * h);
			e.xdir = Math.random() > 0.5 ? -1 : 1;
			e.ydir = Math.random() > 0.5 ? -1 : 1;

			this.add(e);

			e.update = function () {
				if (this.x >= w || this.x <= 0) {
					this.xdir *= -1;
				}
				if (this.y >= h || this.y <= 0) {
					this.ydir *= -1;
				}

				this._pixiSprite.x += this.xdir;
				this._pixiSprite.y += this.ydir;
				//sprites[i].rotation += 0.1;
			};
		}
	}
}

export default WorldScreen;