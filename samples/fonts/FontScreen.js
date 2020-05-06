import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import GFX from "../../../src/gfx/GFX.js";
import Text from "../../src/gfx/Text.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";

class FontScreen extends Screen {
	constructor() {
		super();

		this.getLayers(0).clearColor = "#333333";

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
				GFX.get(0).text("font0", 4 + (i * 7), 26 + Math.cos(i/3 + this.count) * Math.max(0, 20 - this.count), char, "#000000");

				// colored text using predefined color palette
				GFX.get(0).text("font0", 3 + (i * 7), 25 + Math.cos(i/3 + this.count) * Math.max(0, 20 - this.count), char, GFX.pal((this.col + i) % 15));
			}
			this.count += this.step;

			if (animationDelay.isReady()) {
				this.col++;
			}
		};
		this.add(animatedText);


		/**
		 * Multi-line Text Rendering Demo
		 */
		let multilineMessage = `This is a demo of the
built-in font: 'font0'.
It supports kerning.
The sample is rendered
with a 'leading' of 2.`;

		let multilineTextShadow = new Text(multilineMessage, 6, 61, 2, true);
		multilineTextShadow.color = "#000000";
		this.add(multilineTextShadow);

		let multilineTextColored = new Text(multilineMessage, 5, 60, 2, true);
		multilineTextColored.color = "#FF0085";
		this.add(multilineTextColored);


		/**
		 * Custom ASCII Bitmap Font Demo
		 */
		let customMsg = `
This is a custom font.
It's is 8x8 pixels in
format and monospaced.
Kerning values can be
provided too!
A custom font is not
required to use ASCII
ordering. This is use-
full if you want to
use special characters
e.g. German Umlauts.
`;
		let customFont = new Text(customMsg, 5, 115, 2);
		customFont.color = "#FF8500";
		this.add(customFont);


		/**
		 * Lorem Ipsum sample
		 */
		let lorem =
`Following Witty Engine!
Lorem Ipsum dolor sit
amet, consetetur sad
diam nonumy eirmod
tempor invidunt ut la-
bore et dolore magna
aliquyam erat, sed
diam voluptua.

At vero eos et accu.
Stet clita kasd guber
gren, no sea takimat!

  Character Order:
--------------------
!"#$%&'()*+,-./
0123456789:;<=>?@
ABCDEFGHIJKLM
NOPQRSTUVWXYZ
[\\]^_\`
abcdefghijklm
nopqrstuvwxyz
{|}
`
		// TODO: Activate for performance test
		// let loremFontShadow = new Text(lorem, 169, 8, 1, true);
		// loremFontShadow.color = "#000000";
		// this.add(loremFontShadow);

		let loremFontColor = new Text(lorem, 168, 7, 2, true);
		loremFontColor.color = "#ffffff";
		this.add(loremFontColor);
	}

}

export default FontScreen;