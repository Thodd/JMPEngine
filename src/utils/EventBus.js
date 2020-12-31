const _channels = {};

const api = {
	/**
	 * Subscribes to an event.
	 *
	 * @param {string} eventName the event name to which the listener should be subscribed
	 * @param {function} listener a listener function
	 */
	subscribe(eventName, listener) {
		_channels[eventName] = _channels[eventName] || [];

		let i = _channels[eventName].indexOf(listener);
		if (i < 0) {
			_channels[eventName].push(listener);
		}
	},

	/**
	 * Unsubscribes from an event.
	 *
	 * @param {string} eventName the event name from which the listener should be unsubscribed
	 * @param {function} listener the listener which should be unsubscribed
	 */
	unsubscribe(eventName, listener) {
		let chan = _channels[eventName];

		if (chan) {
			let i = chan.indexOf(listener);
			if (i >= 0) {
				chan.splice(i, 1);
			}
		}
	},

	/**
	 * Removes all event listeners currently subscribed to the given event.
	 *
	 * @param {string} eventName the event name for which all listeners should be removed
	 */
	unsubscribeAll(eventName) {
		let chan = _channels[eventName];
		if (chan) {
			chan = [];
		}
	},

	/**
	 * Publishes an event.
	 *
	 * @param {string} eventName the event name which should be fired
	 * @param {any} eventData the event data which will be handed to all listeners
	 * @param {boolean} async whether the event listeners are called asynchronously form within a setTimeout(fn, 0)
	 */
	publish(eventName, eventData, async) {
		let listeners = _channels[eventName];

		if (listeners) {
			let evtObj = {
				eventName: eventName,
				data: eventData
			};
			listeners.forEach(function(fn) {
				if (async) {
					setTimeout(function() {
						// we make an explicit call to keep the this context of the listener (in case it was bound before)
						fn(evtObj);
					},0);
				} else {
					fn(evtObj);
				}
			});
		}
	}
};

export default api;