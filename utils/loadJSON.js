/**
 * Send a GET xhr
 */
async function loadJSON(url) {
	return new Promise(function(res, rej) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
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

export default loadJSON;