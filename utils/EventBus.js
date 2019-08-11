/**
 * Event Bus
 */
var mChannels = {};

/**
 * Subscribe to the given event channel.
 */
function subscribe(sChannel, fnCallback) {
	mChannels[sChannel] = mChannels[sChannel] || [];
	if (mChannels[sChannel].indexOf(fnCallback) == -1) {
		mChannels[sChannel].push(fnCallback);
	}
}

/**
 * Unsubscribe the given callback from the given channel.
 */
function unsubscribe(sChannel, fnCallback) {
	if (mChannels[sChannel]) {
		var i = mChannels[sChannel].indexOf(fnCallback);
		if (i >= 0) {
			mChannels[sChannel].splice(i, 1);
		}
	}
}

/**
 * Publish event on the give channel
 */
function publish(sChannel, oEvent) {
	var aListeners = mChannels[sChannel];
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