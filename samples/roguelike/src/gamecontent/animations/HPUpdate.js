import AnimationBase from "../../core/animations/AnimationBase.js";
import ActorBase from "../../engine/actors/ActorBase.js";
import { char2id } from "../../engine/utils/RLTools.js";
import Colors from "../Colors.js";

class HPUpdate extends AnimationBase {
	constructor() {
		super();
		// we keep a reusable animation actor,
		// we only want to display the HPUpdate animation for a couple of frames
		this._animationActor = new ActorBase();
	}

	setVisuals(hpDelta) {
		// initially the animation actor is invisible, it will be rendered once its needed
		this._animationActor.visible = false;

		// visuals
		this._animationActor.id = hpDelta < 0 ? char2id("/") : char2id("▲");
		this._animationActor.color = hpDelta < 0 ? Colors[0] : Colors[3];
		this._animationActor.background = hpDelta < 0 ? Colors[7] : Colors[11];
	}

	setInfo(info) {
		this._affectedActor = info.actor;
		this._frameCount = 0;

		this.setVisuals(info.hpDelta);

		// add the animationActor to the same cell on which the affected actor sits
		// this will bring the animationActor to the front
		this._affectedActor.getCell().addActor(this._animationActor);
	}

	animate() {
		this._animationActor.visible = true;

		this._frameCount++;
		if (this._frameCount >= 5) {
			// remove animation actor again
			this._animationActor.removeFromCell();
			// and that's it :)
			this.done();
		}
	}
}

export default HPUpdate;