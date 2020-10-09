import Actor from "../Actor.js";
import Interactable from "./Interactable.js";
import { log } from "../../../../../src/utils/Log.js";

class Sign extends Interactable {
	constructor(x, y, msg) {
		// a sign is only interactable from below, or "down"
		super(x, y, ["down"]);

		this.msg = msg;
	}

	interact() {
		log("player looking at sign", "Sign");
	}
}

export default Sign;