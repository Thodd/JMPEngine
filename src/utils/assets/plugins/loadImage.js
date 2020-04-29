export default function(resource) {
	return new Promise(function(resolve) {
		var raw = new Image();
		raw.src = resource.url;
		raw.onload = function () {
			resolve(raw);
		};
	});
}