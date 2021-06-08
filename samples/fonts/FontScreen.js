import Screen from "../../../src/game/Screen.js";
import BitmapText from "../../src/game/BitmapText.js";
import FrameCounter from "../../../src/utils/FrameCounter.js";

class FontScreen extends Screen {
	constructor() {
		super();

		// sample palette from: https://colorhunt.co/palette/196113
		let palette = [0x0c3d5e,0x0f4c75,0x3282b8,0xbbe1fa,0xffffff,0xbbe1fa,0x3282b8,0x0f4c75,0x0c3d5e];

		// Text + animation
		let animatedText = new BitmapText({
			font: "vfr95_outline",
			text: "!! Animated Text !!"
		});

		animatedText.col = 0;
		animatedText.count = 0;
		animatedText.step = 0.1;

		// we delay the color changing for 4 frames,
		// otherwise the rainbow effect is too fast to appreciate ;)
		// 60 color changes per second is pretty fast for the human eye...
		let animationDelay = new FrameCounter(4);

		animatedText.update = function() {
			// sine wave animation
			for (let i = 0; i < this._text.length; i++) {
				let char = this.getSpriteForChar(i);

				// black shadow ("#000000")
				char.x = 4 + (i * 8);
				char.y = 26 + Math.cos(i/3 + this.count) * Math.max(0, 20 - this.count);

				char.tint = palette[(this.col + i) % (palette.length)];
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
		let multilineMessage = `<c=0xFF0085>This is a demo of the
built-in</c> font: 'font0'.
It supports kerning.
The sample is rendered
with a 'leading' of 2.`;

		let multilineTextColored = new BitmapText({text: multilineMessage, x: 5, y: 60, leading: 2});
		this.add(multilineTextColored);


		/**
		 * Custom ASCII Bitmap Font Demo
		 */
		let customMsg = `
This is a custom
font. It's is 8x8
pixels in format
and monospaced.
A custom font is
not required to
use ASCII ordering.
This is useful
if you want to use
non-ASCII symbols.
`;
		let customFont = new BitmapText({font: "vfr95_outline", text: customMsg, x: 5, y: 115, color: 0xFF8500, leading: 2});
		this.add(customFont);

		/**
		 * Lorem Ipsum sample
		 */
		let lorem =
`The following paragraph
is a kerning & leading (3)
test.

[Lady Windermere]:
* taking her husband's
hand to Lord Augustus *
"Ah, you're marrying a
very good woman!".

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
		let loremFontColor = new BitmapText({text: lorem, x: 164, y: 7, leading: 3});
		this.add(loremFontColor);
	}

}

export default FontScreen;