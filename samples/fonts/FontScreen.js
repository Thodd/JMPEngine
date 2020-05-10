import Screen from "../../../src/game/Screen.js";
import Entity from "../../../src/game/Entity.js";
import GFX from "../../../src/gfx/GFX.js";
import Text from "../../src/gfx/Text.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";

class FontScreen extends Screen {
	constructor() {
		super();

		this.getLayer(0).clearColor = "#333333";

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
		//GFX.setRenderMode(0, GFX.RenderModes.RAW);
		//GFX.setRenderMode(1, GFX.RenderModes.RAW);

		animatedText.render = function() {
			for (let i = 0; i < this.msg.length; i++) {
				let char = this.msg[i];

				// black shadow ("#000000")
				GFX.get(1).text("font0", 4 + (i * 7), 26 + Math.cos(i/3 + this.count) * Math.max(0, 20 - this.count), char, "#000000");

				// colored text using predefined color palette
				GFX.get(1).text("font0", 3 + (i * 7), 25 + Math.cos(i/3 + this.count) * Math.max(0, 20 - this.count), char, GFX.pal((this.col + i) % 15));
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

		let multilineTextShadow = new Text({text: multilineMessage, x: 6, y: 61, color: "#000000", leading: 2, useKerning: true});
		this.add(multilineTextShadow);

		let multilineTextColored = new Text({text: multilineMessage, x: 5, y: 60, color: "#FF0085", leading: 2, useKerning: true});
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
		let customFont = new Text({text: customMsg, x: 5, y: 115, color: "#FF8500", leading: 2});
		this.add(customFont);


		/**
		 * Lorem Ipsum sample
		 */
		let lorem =
`The following paragraph
is a kerning & leading
test.
Rendering longer texts
will take some time when
instantiating a new Text
Entity.
The rendertime during a
single frame however
is pretty short, as an
offscreen buffer is
used for pre-rendering.

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
		let loremFontShadow = new Text({text: lorem, x: 165, y: 8, color: "#000000", leading: 2, useKerning: true});
		this.add(loremFontShadow);

		let loremFontColor = new Text({text: lorem, x: 164, y: 7, leading: 2, useKerning: true});
		this.add(loremFontColor);
	}

}

export default FontScreen;