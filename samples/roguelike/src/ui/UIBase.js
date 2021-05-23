import EventBus from "../../../../src/utils/EventBus.js";

/**
 * Base Class for all UI elements.
 * Handles default event-listener registration.
 * @abstract
 */
class UIBase {
	constructor(spec) {
		this._screen = spec.screen;
		this._event = spec.event;
		this._listener = this.update.bind(this);
	}

	/**
	 * Default update hook.
	 * Registered to the given event.
	 */
	update() {}

	/**
	 * Subscribes the default listener to the given event.
	 * Override in subclasses for non default event-handling.
	 */
	sub() {
		EventBus.subscribe(this._event, this._listener);
	}

	/**
	 * Unsubscribes the default listener from the given event.
	 * Override in subclasses for non default event-handling.
	 */
	unsub() {
		EventBus.unsubscribe(this._event, this._listener);
	}
}

export default UIBase;