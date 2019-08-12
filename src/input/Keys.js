const Keys = {};

/**
 * Key Codes 'Constants'
 */
Keys.BACKSPACE = 8;
Keys.TAB = 9;
Keys.ENTER = 13;
Keys.SHIFT = 16;
Keys.CONTROL = 17;
Keys.ALT = 18;
Keys.PAUSE = 19;
Keys.CAPSLOCK = 20;
Keys.ESC = 27;
Keys.SPACE = 32;
Keys.PAGE_UP = 33;
Keys.PAGE_DOWN = 34;
Keys.END = 35;
Keys.HOME = 36;
Keys.LEFT = 37;
Keys.UP = 38;
Keys.RIGHT = 39;
Keys.DOWN = 40;
Keys.INSERT = 45;
Keys.DELETE = 46;

Keys.MULTIPLY = 106;
Keys.ADD = 107;
Keys.SUBTRACT = 109;
Keys.POINT = 110;
Keys.DIVIDE = 111;

Keys.NUMLOCK = 144;
Keys.SCROLLOCK = 145;
Keys.SEMICOLON = 186;
Keys.EQUALS = 187;
Keys.COMMA = 188;
Keys.DASH = 189;
Keys.PERIOD = 190;
Keys.SLASH = 191;
Keys.ACCENT_GRAVE = 192;
Keys.BRACKET_OPEN = 219;
Keys.BACKSLASH = 220;
Keys.BRACKET_CLOSE = 221;
Keys.SINGLEQUOTE = 222;

// alphanumeric characters
var i,
	sNumbers = "0123456789",
	sAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

for (i = 0; i < sNumbers.length; i++) {
	Keys["NUM_" + sNumbers[i]] = 48 + i;
}

for (i = 0; i < sAlphabet.length; i++) {
	Keys[sAlphabet[i]] = 65 + i;
}

export default Keys;