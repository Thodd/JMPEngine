import Manifest from "../../assets/Manifest.js";
import Screen from "../Screen.js";
import FrameCounter from "../../utils/FrameCounter.js";
import BitmapText from "../BitmapText.js";

class IntroScreen extends Screen {
	constructor(){
		super();

		this.endCounter = new FrameCounter(180);
		this.endPromise = new Promise((resolve) => {
			this.finish = resolve;
		});

		let h = Manifest.get("/h");
		let w = Manifest.get("/w");

		// slashes 1 + 2
		this.showSlashes = new FrameCounter(20);
		this.slashes1 = new BitmapText({
			x: (w - 11 * 8)/2,
			y: h/2 - 14,
			font: "font1",
			color: 0xffffff,
			text: "///"
		});
		this.slashes1.visible = false;
		this.add(this.slashes1);

		this.slashes2 = new BitmapText({
			x: (w - 15 * 8)/2,
			y: h/2 + 6,
			font: "font1",
			color: 0xffffff,
			text: "///"
		});
		this.slashes2.visible = false;
		this.add(this.slashes2);


		// Text + animation
		this.startTextAnimation = new FrameCounter(90);
		let msg = "JMP.px Engine";

		this.animatedText = new BitmapText({
			x: (w - msg.length * 8)/2,
			y: h/2 - 4,
			font: "font1",
			color: 0x76003d,
			text: msg
		});
		this.animatedText.visible = false;
		this.animatedText.col = 0;

		// we delay the color changing for 2 frames
		let colorAnimationDelay = new FrameCounter(2);

		this.animatedText.update = function() {
			if (this.started) {
				let z = this.getSpriteForChar(this.col-2);
				let a = this.getSpriteForChar(this.col-1);
				let b = this.getSpriteForChar(this.col+0);

				if (z) {
					z.tint = 0xff0085;
				}
				if (a) {
					a.tint = 0xff9dd0;
				}
				if (b) {
					b.tint = 0xffffff;
				}

				if (colorAnimationDelay.isReady()) {
					this.col++;
				}
			}
		};

		this.add(this.animatedText);
	}

	update() {
		super.update();

		if (this.showSlashes.isReady()) {
			this.slashes1.visible = true;
			this.animatedText.visible = true;
			this.slashes2.visible = true;
		}

		if (this.startTextAnimation.isReady()) {
			this.animatedText.started = true;
		}

		if (this.endCounter.isReady()) {
			this.finish();
		}
	}

	end() {
		this.slashes1.destroy();
		this.slashes2.destroy();
		this.animatedText.destroy();
	}

	wait() {
		return this.endPromise;
	}
}

export default IntroScreen;