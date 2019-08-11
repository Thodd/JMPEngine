/**
 * Checks if the DOM is ready and if not registers a load event handler.
 */
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

export default domReady;