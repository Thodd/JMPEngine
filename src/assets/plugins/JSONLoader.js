/**
 * Asynchronously loads a JSON resource.
 *
 * @param {object} resourceObject resource definition containing the JSON url (as given to the AssetLoader)
 */
async function load(resourceObject) {
	return new Promise(function(res, rej) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", resourceObject.url);
		xhr.setRequestHeader("accept", "application/json");
		xhr.addEventListener("load", function() {
			res(JSON.parse(this.responseText));
		});
		xhr.addEventListener("error", function(oError) {
			rej(oError);
		});
		xhr.send(null);
	});
}

async function process() {}

export default {
	load,
	process
}