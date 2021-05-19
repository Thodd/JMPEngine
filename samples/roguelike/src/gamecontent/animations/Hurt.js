import AnimationBase from "../../core/animations/AnimationBase.js";
import ActorBase from "../../engine/actors/ActorBase.js";
import { char2id } from "../../engine/utils/RLTools.js";
import Colors from "../Colors.js";

class Hurt extends AnimationBase {
	constructor() {
		super();
		// we keep a reusable animation actor,
		// we only want to display the hurt animation for a couple of frames
		this._animationActor = new ActorBase({
			visuals: {
				id: char2id("/"),
				color: Colors[0],
				background: Colors[7]
			}
		});
	}

	setInfo(info) {
		this._affectedActor = info.actor;
		this._frameCount = 0;

		// add the animationActor to the same cell on which the affected actor sits
		// this will bring the animationActor to the front
		this._affectedActor.getCell().addActor(this._animationActor);
	}

	animate() {
		this._frameCount++;
		if (this._frameCount >= 5) {
			// remove animation actor again
			this._animationActor.removeFromCell();
			// and that's it :)
			this.done();
		}
	}
}

export default Hurt;