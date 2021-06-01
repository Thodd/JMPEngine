// jmp imports
import BitmapText from "../../../src/game/BitmapText.js";
import Screen from "../../../src/game/Screen.js";
import RNG from "../../../src/utils/RNG.js";

// own imports
import Ship from "./Ship.js";
import Squid from "./enemies/Squid.js";
import Constants from "./Constants.js";
import ParticleEmitter from "./effects/ParticleEmitter.js";

class Shmup extends Screen {
	constructor() {
		super();

		this.ship = new Ship();
		this.add(this.ship);

		for (let i = 0; i < 10; i++) {
			let squid = new Squid();
			squid.x = i * 16;
			squid.y = 20;
			this.add(squid);
		}

		// global particle-emitter, used by every entity in the screen
		this.particleEmitter = new ParticleEmitter();
		this.particleEmitter.layer = Constants.Layers.OVER_PLAYER;
		this.add(this.particleEmitter);

		// UI Text
		let text = new BitmapText({
			font: "font1",
			x: 4,
			y: 2,
			text: "L*2         0001352",
			color: 0xc2c3c7
		});
		text.layer = Constants.Layers.UI;
		this.add(text);


		// particle test
		let w = this.getWidth();
		let h = this.getHeight();
		this.registerFrameEventInterval(() => {
			this.particleEmitter.emit({
				sheet: "particles",
				x: RNG.randomInteger(10, w - 10),
				y: RNG.randomInteger(10, h - 10),
				gravity: 0.5, // gives off a speed effect
				delay: 1,
				amount: 10,
				maxAge: 20,
				maxRadius: 2,
				colors: [0xff004d, 0xffa300, 0xffec27, 0xc2c3c7, 0xfff1e8]
			});
		}, 10);

		// cancel after 5 seconds
		// this.registerFrameEvent(() => {
		// 	this.cancelFrameEvent(i);
		// }, 5* 60);
	}

	debug() {}
}

export default Shmup;