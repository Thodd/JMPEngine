const PerformanceTrace = {
	// sometimes the performance API is not available, so we might need to use the Date API
	now: function() {
		if (window.performance) {
			return window.performance.now();
		} else {
			return Date.now();
		}
	},

	updateTime: 0,
	renderTime: 0,
	frameTime: 0,

	drawCalls: 0,

	// resets the drawCalls counter
	_reset: function() {
		this.drawCalls = 0;
	}
};

// debugging shortcut
window.jmp = {
	PerformanceTrace: PerformanceTrace
};

export default PerformanceTrace;