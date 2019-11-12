import Engine from "../../../src/Engine.js";
import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import GFX from "../../../src/gfx/GFX.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";

// First things first: create a new screen
Engine.screen = new Screen();
Engine.screen.getLayers(0).clearColor = "#333333"
/**
 * Low-Level Text Rendering Demo
 */

// create a new Entity which will use the low-level text API to render an animated colored text
let animatedText = new Entity();
animatedText.col = 0;
animatedText.count = 0;
animatedText.step = 0.1;
animatedText.msg = ">JMP Text Render Demo<";

// we delay the color changing for 4 frames,
// otherwise the rainbow effect is too fast to appreciate ;)
// 60 color changes per second is pretty fast for the human eye...
let animationDelay = new FrameCounter(4);

// We define a custom render function on the Entity
// so we can use the low-level GFX API to render a pixel-perfect
// colored and animated Text
animatedText.render = function() {
	for (let i = 0; i < this.msg.length; i++) {
		let char = this.msg[i];

		// black shadow ("#000000")
		GFX.text("font0", 4 + (i * 7), 31 + Math.cos(i/3 + this.count) * Math.max(0, 30 - this.count), char, 0, "#000000");

		// colored text using predefined color palette
		GFX.text("font0", 3 + (i * 7), 30 + Math.cos(i/3 + this.count) * Math.max(0, 30 - this.count), char, 0, GFX.pal[(this.col + i) % 15]);
	}
	this.count += this.step;

	if (animationDelay.isReady()) {
		this.col++;
	}
};
Engine.screen.add(animatedText);


/**
 * Multi-line Text Rendering Demo
 */
let multilineMessage = `This is a Demo for
multi-line Strings.
You can render these
Strings with the
following GFX-API:

  'GFX.textm(...)'
`;

let multilineText = new Entity();

multilineText.render = function() {
	GFX.textm("font0", 11, 81, multilineMessage, 1, "#000000"); // displaced rendering as a "shadow" effect
	GFX.textm("font0", 10, 80, multilineMessage, 1, "#FF0085");
};

Engine.screen.add(multilineText);


/**
 * Custom ASCII Bitmap Font Demo
 */
let customFont = new Entity();
let customMsg = `
This is a sample of a
custom font.
It's a variation of
the built-in 'font0'.
A custom font must be
monospaced and in
ASCII order.
`;
customFont.render = function() {
	GFX.textm("font0", 6, 161, customMsg, 1, "#000000");
	GFX.textm("font0", 5, 160, customMsg, 1);
};

Engine.screen.add(customFont);