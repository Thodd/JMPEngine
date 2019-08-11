
async function domReady() {
	return new Promise((res) => {
		if (document.readyState !== "loading") {
			res();
		} else {
			const _fn = () => {
				document.removeEventListener("DOMContentLoaded", _fn);
				res();
			};
			document.addEventListener("DOMContentLoaded", _fn);
		}
	});
}

async function loadJSON() {
	return Promise.resolve();
}

function dump(method, s, prefix) {
	if (prefix) {
		s = `[${prefix}]: ${s}`;
	}
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

export {
	domReady,
	loadJSON,
	log,
	warn,
	error,
	fail
};