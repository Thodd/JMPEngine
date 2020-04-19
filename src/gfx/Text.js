import { warn, fail } from "../utils/Log.js";
import GFX from "./GFX.js";
import Entity from "../game/Entity.js";
import Manifest from "../Manifest.js";

class Text extends Entity {
	constructor(t, x, y) {
		super(x, y);
		this.text = t;
		this.font = "font0";
		this.color = "#ffffff";
	}

	setSprite() {
		fail("setSprite(): Text entities do not support additional sprites!", "Text-Entity");
	}

	setText(t) {
		this.text = t;
	}

	setFont(f) {
		if (Manifest.get(`/fonts/${f}`)) {
			this.font = f;
		} else {
			warn(`The font '${f}' is not known. Default font 'font0' will be set.`, "Text-Entity");
			this.font = "font0";
		}
	}

	render() {
		super.render();
		GFX.textm(this.font, this.x, this.y, this.text, this.layer, this.color);
	}
}

export default Text;