// jmp imports
import BitmapText from "../../../src/game/BitmapText.js";
import Screen from "../../../src/game/Screen.js";

// own imports
import Ship from "./Ship.js";
import Squid from "./enemies/Squid.js";
import Constants from "./Constants.js";
import ParticleEmitter from "../../../src/game/ParticleEmitter.js";

class Shmup extends Screen {
	constructor() {
		super();

		this.ship = new Ship();
		this.add(this.ship);

		for (let i = 0; i < 8; i++) {
			let squid = new Squid();
			squid.x = i * 16;
			squid.y = 20;
			this.add(squid);
		}

		// global particle-emitters, used by every entity in the screen
		this.enemyDeathEmitter = new ParticleEmitter({
			sheet: "particles",
			delay: 1,
			colors: [0xff004d, 0xffa300, 0xffec27, 0xc2c3c7, 0xfff1e8]
		});
		this.enemyDeathEmitter.layer = Constants.Layers.OVER_PLAYER;
		this.add(this.enemyDeathEmitter);

		// global particle-emitter, used by every entity in the screen
		this.projectileHitEmitter = new ParticleEmitter({
			sheet: "particles",
			delay: 1,
			gravity: 0.2,
			maxAge: 5,
			angle: 0,
			deviation: 1,
			maxRadius: 2,
			colors: [0x008751, 0x00e436, 0xc2c3c7, 0xfff1e8]
		});
		this.projectileHitEmitter.layer = Constants.Layers.OVER_PLAYER;
		this.add(this.projectileHitEmitter);

		// UI Text
		let text = new BitmapText({
			font: "font1",
			x: 4,
			y: 2,
			text: "L*2     0001352",
			color: 0xc2c3c7
		});
		text.layer = Constants.Layers.UI;
		this.add(text);


		// particle test
		// let w = this.getWidth();
		// let h = this.getHeight();

		// this.fireworksEmitter = new ParticleEmitter({
		// 	sheet: "particles",
		// 	gravity: 0.2, // gives off a speed effect
		// 	delay: 1,
		// 	amount: 20,
		// 	maxAge: 20,
		// 	deviation: 1,

		// 	maxRadius: 2,

		// 	minSpeed: 1,
		// 	maxSpeed: 3,

		// 	angle: 0,

		// 	colors: [0xff004d, 0xffa300, 0xffec27, 0xc2c3c7, 0xfff1e8]
		// });
		// this.add(this.fireworksEmitter);
		// this.registerFrameEventInterval(() => {
		// 	this.fireworksEmitter.emit({
		// 		// x: 40,
		// 		// y: 100,
		// 		x: RNG.randomInteger(10, w - 10),
		// 		y: RNG.randomInteger(10, h - 10),
		// 	});
		// }, 10);
	}

	debug() {}
}

export default Shmup;