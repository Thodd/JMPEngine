// jmp imports
import BitmapText from "../../../src/game/BitmapText.js";
import Screen from "../../../src/game/Screen.js";

// own imports
import Ship from "./Ship.js";
import Squid from "./enemies/Squid.js";
import Constants from "./Constants.js";

class Shmup extends Screen {
	constructor() {
		super();

		let squid = new Squid();
		squid.x = 20;
		squid.y = 20;
		this.add(squid);

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