const asInt = [
	0x000000, 0x1D2B53, 0x7E2553, 0x008751,
	0xAB5236, 0x5F574F, 0xC2C3C7, 0xFFF1E8,
	0xFF004D, 0xFFA300, 0xFFEC27, 0x00E436,
	0x29ADFF, 0x83769c, 0xFF77A8, 0xFFCCAA];

const asString = [
	"0x000000", "0x1D2B53", "0x7E2553", "0x008751",
	"0xAB5236", "0x5F574F", "0xC2C3C7", "0xFFF1E8",
	"0xFF004D", "0xFFA300", "0xFFEC27", "0x00E436",
	"0x29ADFF", "0x83769c", "0xFF77A8", "0xFFCCAA"];

const asRGBA = [];

(function() {
	asString.forEach((hex) => {
		let bytes = hex.match(/0x([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})/);
		asRGBA.push({
			r: parseInt(bytes[1], 16),
			g: parseInt(bytes[2], 16),
			b: parseInt(bytes[3], 16),
			a: 0xFF
		});
	});
}());

const count = asInt.length;

function isSameColor(ca, cb) {
	if (ca && cb && // null check pixel might be out of range
		ca.r == cb.r &&
		ca.g == cb.g &&
		ca.b == cb.b &&
		ca.a == cb.a) {
			return true;
		}
	return false;
}

export default {
	asInt,
	asString,
	asRGBA,
	count,
	isSameColor
};