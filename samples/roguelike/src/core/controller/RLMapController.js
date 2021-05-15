import EventBus from "../../../../../src/utils/EventBus.js";
import Keyboard from "../../../../../src/input/Keyboard.js";
import Timeline from "./Timeline.js";

import Events from "../../Events.js";
import AnimationSystem from "../animations/AnimationSystem.js";
import FOV from "./FOV.js";

/**
 * Base class for RLMapController(s).
 * Each RLMap comes with a dedicated controller instance.
 * @abstract
 */
class RLMapController {
	constructor(map) {
		this._map = map;

		// animation system
		this._animationSystem = new AnimationSystem();
		this._animationSystem.addPhases(this.setupAnimationPhases());
		this._animationsRunning = false;

		// timeline for actors turn handling
		this._timeline = new Timeline();

		// standard fov implementation
		this._fov = new FOV(this._map);

		// register event handler for input
		Keyboard.registerEndOfFrameHandler(this._handleInput.bind(this));

		// register end-of-turn listener
		EventBus.subscribe(Events.END_OF_PLAYER_TURN, this._handleEndOfPlayerTurn.bind(this));
	}

	/**
	 * Lifecycle hook for the setup of the animation phases.
	 * Should be overwritten in the RLMapController subclasses.
	 * If not overwritten, a default AnimationPhase called "DEFAULT" is created.
	 *
	 * @returns {string[]|object[]} the list of animation phases supported by the RLMapController.
	 * @public
	 */
	setupAnimationPhases() {
		return ["DEFAULT"];
	}

	/**
	 * Returns the RLMap to which this controller instance belongs.
	 * @returns {RLMap}
	 * @public
	 */
	getMap() {
		return this._map;
	}

	/**
	 * Returns the Timeline used for RLActor turn scheduling.
	 * @returns {Timeline}
	 * @public
	 */
	getTimeline() {
		return this._timeline;
	}

	/**
	 * Returns the AnimationSystem.
	 * @returns {AnimationSystem}
	 * @public
	 */
	getAnimationSystem() {
		return this._animationSystem;
	}

	/**
	 * Returns the currently used FOV System.
	 * @returns {FOV}
	 * @public
	 */
	getFOVSystem() {
		return this._fov;
	}

	/**
	 * Init hook. Called after the associated map was fully created and populated.
	 * @public
	 */
	init() {}

	/**
	 * Update Hook.
	 * Must be called on each Engine game frame.
	 */
	update() {
		// during the animation phase we update the system
		if (this._animationsRunning) {
			let animationsFinished = this._animationSystem.update();

			if (animationsFinished) {
				// we wait for the player & NPC turns to end now for the next animation phase
				this._animationsRunning = false;
			}
		}
	}

	/**
	 * Internal hook for handling input.
	 * Ignores input if animations are running.
	 */
	_handleInput() {
		if (this._animationsRunning) {
			return;
		}

		this.handleInput();
	}

	/**
	 * Hook to handle user input.
	 * @public
	 */
	handleInput() {}

	/**
	 * Event-Handler for ending the players turn.
	 * Starts animation processing immediately.
	 */
	_handleEndOfPlayerTurn() {
		// we synchronously calculate all NPC turns & schedule their animations
		this._timeline.advanceNPCs();

		// which goes over to the animation phase again
		this._animationsRunning = true;
	}

}

export default RLMapController;