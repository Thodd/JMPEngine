// jmp imports
import BitmapText from "../../../src/game/BitmapText.js";
import Screen from "../../../src/game/Screen.js";

// own imports
import Ship from "./Ship.js";
import Squid from "./enemies/Squid.js";
import Constants from "./Constants.js";
import ParticleEmitter from "./effects/ParticleEmitter.js";

class Shmup extends Screen {
	constructor() {
		super();

		for (let i = 0; i < 10; i++) {
			let squid = new Squid();
			squid.x = i * 16;
			squid.y = 20;
			this.add(squid);
		}

		// let cucumber = new Entity();
		// cucumber.configSprite({
		// 	sheet: "enemies",
		// 	animations: {
		// 		default: "idle",
		// 		idle: {
		// 			frames: [17, 18, 17, 19],
		// 			dt: 10
		// 		}
		// 	}
		// });
		// this.add(cucumber);

		// cucumber.x = 40;
		// cucumber.y = 20;


		this.particleEmitter = new ParticleEmitter();
		this.particleEmitter.layer = Constants.Layers.OVER_PLAYER;
		this.add(this.particleEmitter);


		let text = new BitmapText({
			font: "font1",
			x: 4,
			y: 2,
			text: "L*2         0001352",
			color: 0xc2c3c7
		});
		text.layer = Constants.Layers.UI;
		this.add(text);


		this.ship = new Ship();
		this.add(this.ship);
	}
}

export default Shmup;