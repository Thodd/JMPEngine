import { exposeOnWindow } from "./Log.js";

const now = function() {
	if (window.performance) {
		return window.performance.now();
	} else {
		return Date.now();
	}
};

const traces = {};

const PerformanceTrace = {
	updateTime: 0,
	renderTime: 0,
	frameTime: 0,
	drawCalls: 0,

	start: function(s) {
		traces[s] = now();
	},

	end: function(s) {
		let end = now();
		this[`${s}Time`] = end - traces[s];
	},

	finalize: function() {
		this.frameTime = this.updateTime + this.renderTime;
	},

	// resets the drawCalls counter
	reset: function() {
		this.updateTime = 0;
		this.renderTime = 0;
		this.frameTime = 0;
		this.drawCalls = 0;
	}
};

exposeOnWindow("PerformanceTrace", PerformanceTrace);

export default PerformanceTrace;