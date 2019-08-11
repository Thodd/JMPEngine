import { log, error } from "../core/Utils.js";

// private
let initialized = false;

const Screen = {

	init(w=160, h=120, scale=2) {

		if (initialized) {
			error("Screen already initialized", "Screen");
			return;
		}

		this._dom = document.createElement("canvas");

		this._dom.width = w;
		this._dom.height = h;

		Object.assign(this._dom.style, {
			background: "#000000",
			width: (w * scale) + "px",
			height: (h * scale) + "px",
			imageRendering: "pixelated"
		});

		initialized = true;
		log(`Initialized with (w=${w}, h=${h}, scale=${scale}).`, "Screen");
	},

	getDOM() {
		return this._dom;
	}
}

export default Screen;