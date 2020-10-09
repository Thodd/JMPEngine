function dump(method, s, prefix) {
	if (prefix) {
		s = `[${prefix}] ${s}`;
	}
	// eslint-disable-next-line no-console
	console[method](s);
}

function log(s, prefix) {
	dump("log", s, prefix);
}

function warn(s, prefix) {
	dump("warn", s, prefix);
}

function error(s, prefix) {
	dump("error", s, prefix);
}

function fail(s, prefix) {
	if (prefix) {
		s = `[${prefix}]: ${s}`;
	}
	throw new Error(s);
}

function assert(expr, s, prefix) {
	if (!expr) {
		fail(s, prefix);
	}
}

export {
	log,
	warn,
	error,
	fail,
	assert
};