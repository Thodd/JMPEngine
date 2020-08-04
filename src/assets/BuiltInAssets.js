// map for all built-in assets
// can be passed as-is to the AssetLoader
// all built-in assets are stored as data-urls
const assets = {
	"spritesheets": {},
	"fonts": {}
};

// ----------- spritesheets ------------
// font0 - spritesheet definition
assets.spritesheets["font0"] = {
	"url": "data:image/png;base64,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",
	"w": 8,
	"h": 8
};

// --------------- fonts ---------------
// font0 - font-definition including kerning
assets.fonts["font0"] = {
	"spritesheet": "font0",
	"charOrder": ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}`,
	"kerning": {
		"spacing": 5,
		"default": -1
	}
};

let kerningPairs = assets.fonts["font0"]["kerning"];

// slim characters
let kern = {
	"!": -2,
	".": -4,
	":": -3,
	";": -2,
	"'": -5,
	'"': -3,
	"|": -4,
	"`": -3,
	"[": -2,
	"]": -2,
	"(": -3,
	")": -2,
	"<": -3,
	">": -3,

	"1": -3,

	"f": -2,
	"h": -2,
	"i": -5,
	"I": -4,
	"j": -2,
	"k": -2,
	"l": -4,
	"n": -2,
	"s": -2,
	"t": -2,
	"x": -2,
	"z": -2
};
Object.keys(kern).forEach((smallChar) => {
	for (let char of assets.fonts["font0"]["charOrder"]) {
		kerningPairs[`${smallChar}${char}`] = kern[smallChar];
	}
});

// "nearly" ligatures... but not really ;)
kerningPairs["lt"] = -5;
kerningPairs["ea"] = -2;
kerningPairs["ra"] = -2;
kerningPairs["rj"] = -3;
kerningPairs["fj"] = -4;
kerningPairs["pj"] = -2;
kerningPairs["vj"] = -2;

export default assets;