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
assets.spritesheets["font1"] = {
	"url": "data:image/png;base64,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",
	"w": 8,
	"h": 8
};
// default spritesheet for particle system
assets.spritesheets["__jmp_particles"] = {
	"url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAACEUlEQVR4Xu3bYbOCIBCF4ev//9HeqRlLTWWXs6DA29fAyaezQCTT30Ne8zzPno8yTdPkaV+q7S0fwotlvfk7UKsBlkI7w62FWRywNtwetDRkMcC74WpBhgM+Da40ZBjg0+FKQYYAtoa3YEaMjzJgq3hRiNmArcNFlXQWYG94ShrdgL3i5SK6AHvHy0E0A46C50U0AY6G50EE8GKrx7JOTAKOmj5rCi8BR8ezIJ4Cgret7bNyBtC43e0CJH3HqkeIhwkEUAAE77qm9yn8SSCAAiB4thllncJNAgEUAMGz4e0X158EAgigT0BsvYyD7wSSvjzNFyKAeXbvXgAKeACKeABGATKBaJITgABqAmJvEgigKCB2J4EAigJidxIIoCggdieBAIoCYncSqAKyoZovyH5gvh0bqqIdgABGCIjX+IyBTCR+yc3fmgAC6BcQe/wkkBTaRXk6y2512PIUkBSmZXlCNW102SIJSArP/XhKPzh9r8tx0MaI6jpoQxn/qroBQfwiXh175bhrooRTZ4aTgCMnMYV3OYmsv5hRn+AKAxwxhRY8cwKXNI6SRCueG3CEJHrwsgB7RvTiZQP2iJiDJwH2Mi7mwi33b1oHpn4utjq5qHghCWw1iRF4oYCtQEbBhZbwUYk/rayj4YoDPiWRpeCqAd4FWRquOmCNzYlaaOt7CVnGpJY5lve9Y+YdWEf38Q+2U0AwOmLyYQAAAABJRU5ErkJggg==",
	"w": 80,
	"h": 80
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
assets.fonts["font1"] = {
	"spritesheet": "font1"
};

// font 0 kerning values
let kerningPairs = assets.fonts["font0"]["kerning"];

// slim characters
let slimKerns = {
	" ": 0,
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
	"@": +1,

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
	"z": -2,

	// upper case
	"A": 0,
	"B": 0,
	"C": 0,
	"D": 0,
	"E": 0,
	"G": 0,
	"H": 0,
	"O": 0,
	"Q": 0,
	"R": 0,
	"U": 0,
	"Z": 0
};
Object.keys(slimKerns).forEach((smallChar) => {
	for (let char of assets.fonts["font0"]["charOrder"]) {
		kerningPairs[`${smallChar}${char}`] = slimKerns[smallChar];
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

kerningPairs["Pa"] = -2;

kerningPairs["Ta"] = -2;
kerningPairs["Td"] = -2;
kerningPairs["Te"] = -2;
kerningPairs["Tg"] = -2;
kerningPairs["To"] = -2;
kerningPairs["Tq"] = -2;
kerningPairs["Ts"] = -2;

export default assets;