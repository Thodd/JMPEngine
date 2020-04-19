import Manifest from "../Manifest.js";
import Screen from "../game/Screen.js";
import GFX from "../gfx/GFX.js";
import FrameCounter from "../utils/FrameCounter.js";
import Entity from "../game/Entity.js";

class IntroScreen extends Screen {
	constructor(){
		super();

		this.endCounter = new FrameCounter(240);
		this.endPromise = new Promise((resolve) => {
			this.finish = resolve;
		});

		let pal = ["#f8f5b1", "#edd06b", "#de9b36", "#d57228"];
		this.getLayers(0).clearColor = "#332c50";

		let msg = "... JMP.px Engine !";
		let ml = 0;

		// we delay the color changing for 4 frames,
		// otherwise the effect is too fast to appreciate ;)
		// 60 color changes per second is pretty fast for the human eye...
		let animationDelay = new FrameCounter(5);

		let h = Manifest.get("/h");
		let w = Manifest.get("/w");
		let shiftLeft = Math.floor((msg.length*7)/2);
		let shiftTop = 4;

		// We define a custom render function on the Entity
		// so we can use the low-level GFX API to render a pixel-perfect
		// colored and animated Text
		let animatedText = new Entity();
		animatedText.render = function() {
			for (let i = 0; i < ml; i++) {
				let char = msg[i];

				let x = w/2 + (i*7) - shiftLeft;
				let y = h/2 - shiftTop;

				// black shadow ("#000000")
				GFX.text("font0", x+1, y+1, char, 1, "#000000");

				// colored text using predefined color palette
				GFX.text("font0", x, y, char, 1, pal[0]);
			}

			if (animationDelay.isReady()) {
				if (ml < msg.length) {
					ml++;
				}
			}
		};
		this.add(animatedText);
	}

	update() {
		super.update();

		if (this.endCounter.isReady()) {
			this.finish();
		}
	}

	wait() {
		return this.endPromise;
	}
}

export default IntroScreen;