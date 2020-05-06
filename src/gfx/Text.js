import { warn, fail } from "../utils/Log.js";
import GFX from "./GFX.js";
import Entity from "../game/Entity.js";
import Manifest from "../Manifest.js";

class Text extends Entity {
	constructor(t, x, y, leading=0, useKerning=false) {
		super(x, y);
		this.font = "font0";
		this.color = "#ffffff";
		this.leading = leading;
		this.useKerning = useKerning;

		this.setText(t);
	}

	setSprite() {
		fail("setSprite(): Text entities do not support additional sprites!", "Text-Entity");
	}

	setText(t) {
		this.text = t;
		this.backbuffer = document.createElement("canvas");

		// set dimensions to the maximum possible values
		//TODO: Rerender to back-buffer
	}

	setFont(f) {
		if (Manifest.get(`/assets/fonts/${f}`)) {
			this.font = f;
		} else {
			warn(`The font '${f}' is not known. Default font 'font0' will be set.`, "Text-Entity");
			this.font = "font0";
		}
	}

	render() {
		// TODO: Split text here in multiple lines, and render separately   -->   remove textm API
		GFX.get(this.layer).textm(this.font, this.x, this.y, this.text, this.color, this.leading, this.useKerning);
	}
}

export default Text;