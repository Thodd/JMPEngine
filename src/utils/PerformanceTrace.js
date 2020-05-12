import { exposeOnWindow } from "./Log.js";

const now = function() {
	if (window.performance) {
		return window.performance.now();
	} else {
		return Date.now();
	}
};

const traces = {};

/**
 * Tracks Performance information every frame.
 * - updateTime:  The time [ms] spent in the update-cycle of each frame
 * - renderTime:  The time [ms] spent in the render-cycle of each frame
 * - frameTime:   The total time [ms] spent each frame (includes updateTime and renderTime)
 * - drawCalls:   The number of draw calls made on GFX Buffers in <code>GFX.RenderModes.BASIC</code>. Rule of thumb: The higher the number the more time is spent in rendering.
 * - pixelsDrawn: The number of pixels drawn on GFX Buffers in <code>GFX.RenderModes.RAW</code>. Rule of thumb: The higher the number the more time is spent in rendering.
 */
const PerformanceTrace = {
	updateTime:  0,
	renderTime:  0,
	frameTime:   0,

	drawCalls:   0,
	pixelsDrawn: 0,

	start: function(s) {
		traces[s] = now();
	},

	end: function(s) {
		let end = now();
		this[`${s}Time`] = (end - traces[s]);
	},

	finalize: function() {
		this.frameTime = this.updateTime + this.renderTime;
	},

	// resets the drawCalls counter
	reset: function() {
		this.updateTime  = 0;
		this.renderTime  = 0;
		this.frameTime   = 0;
		this.drawCalls   = 0;
		this.pixelsDrawn = 0;
	}
};

exposeOnWindow("PerformanceTrace", PerformanceTrace);

export default PerformanceTrace;