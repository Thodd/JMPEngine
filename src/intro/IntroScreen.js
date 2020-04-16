
import Screen from "../game/Screen.js";
import Text from "../gfx/Text.js";
import FrameCounter from "../utils/FrameCounter.js";

class IntroScreen extends Screen {
	constructor(){
		super();
		this.getLayers(0).clearColor = "#111111"
		this.text = new Text(":: Mint ::\n\nStarting Engine", 2, 2);
		this.text.color = "#FF8500";
		this.add(this.text);

		this.animCounter = new FrameCounter(10);
		this.endCounter = new FrameCounter(60);
		this.endPromise = new Promise((resolve) => {
			this.finish = resolve;
		});
	}

	update() {
		super.update();

		if (this.animCounter.isReady()) {
			this.text.text += ".";
		}

		if (this.endCounter.isReady()) {
			this.finish();
		}
	}

	wait() {
		return this.endPromise;
	}
}

export default IntroScreen;