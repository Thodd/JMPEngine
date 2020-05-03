/**
 * Event Bus
 */
const channels = {};

/**
 * Subscribe to the given event channel.
 */
function subscribe(ch, callback) {
	channels[ch] = channels[ch] || [];
	if (channels[ch].indexOf(callback) == -1) {
		channels[ch].push(callback);
	}
}

/**
 * Unsubscribe the given callback from the given channel.
 */
function unsubscribe(ch, callback) {
	if (channels[ch]) {
		let i = channels[ch].indexOf(callback);
		if (i >= 0) {
			channels[ch].splice(i, 1);
		}
	}
}

/**
 * Publish event on the give channel
 */
function publish(ch, oEvent) {
	let aListeners = channels[ch];
	if (aListeners) {
		aListeners.forEach(function(oListener) {
			oListener(oEvent);
		});
	}
}

export default {
	subscribe,
	unsubscribe,
	publish
};