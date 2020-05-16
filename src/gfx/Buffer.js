import { fail, warn } from "../utils/Log.js";
import Manifest from "../Manifest.js";

import Basic from "./renderer/Basic.js";
import Raw from "./renderer/Raw.js";

class Buffer {
	constructor(w, h, scale=1, depth="offscreen") {
		this.width = w;
		this.height = h;
		this.scale = scale;
		this.depth = depth;

		// create canvas & context
		this._canvasDOM = document.createElement("canvas");
		this._canvasDOM.classList.add("jmpCanvas");
		this._canvasDOM.style.cursor = Manifest.get("/hideCursor") ? "none" : "";

		// the canvas itself however has a fixed width and height
		this._canvasDOM.width = this.width;
		this._canvasDOM.height = this.height;

		// the style of the canvas scales it to the given scale factor
		this._canvasDOM.style.width = w * scale;
		this._canvasDOM.style.height = h * scale;

		// render context
		this._ctx = this._canvasDOM.getContext("2d");
		this._ctx._depth = depth;

		// ok here's something funny:
		// the imageSmoothing for this context has to be deactivated AFTER giving the canvas DOM a width and height
		// Changing the dimensions resets the render context somehow...
		this._ctx.imageSmoothingEnabled = false;

		// create renderer instances
		this._renderers = {
			"BASIC": new Basic(this, Manifest.get()),
			"RAW"  : new Raw(this, Manifest.get())
		};

		// create initial state
		this.reset(true);
	}

	/**
	 * Reset the Buffer to its initial state.
	 * <b>Beware</b>: Used at your own risk!
	 *
	 * <b>Note</b>:
	 * Buffers in RenderModes.RAW will also be reverted back to GFX.RenderModes.BASIC!
	 * The correct point in time to change the RenderMode of a Buffer us during the setup-event of the Screen class.
	 * You can simply call setRenderMode() with without any performance impact.
	 *
	 * @param {boolean} shouldClear whether the Buffer should be cleared after resetting to the inital state
	 */
	reset(shouldClear) {
		// default renderer is "Basic"
		this.setRenderMode(Buffer.RenderModes.BASIC);

		// camera values
		this.camX = 0;
		this.camY = 0;
		this._cameraIsFixed = false;

		// screen clearing
		// the lowest layer is cleared with a color instead of transparent
		this._clearColor = this.depth == 0 ? "#222222" : "transparent";
		this._autoCleared = true;

		if (shouldClear) {
			this.renderer.clear();
		}
	}

	/**
	 * Changes the rende mode of this Buffer instance.
	 * @param {GFX.RenderModes} r One of the available <code>GFX.RenderModes</code>
	 */
	setRenderMode(r) {
		if (!Buffer.RenderModes[r]) {
			fail(`Unknown render mode: ${r}.`, "GFX");
		}
		this.renderMode = r;

		// The renderers might retain some "costly" ImageData objects,
		// which are not needed for Screens which will mainly use the BASIC RenderMode.
		// The difference can be seen in the Chrome/Edge Memory profiler, even with only two layers.
		if (this.renderer) {
			this.renderer._release();
		}

		this.renderer = this._renderers[r];
	}

	/**
	 * Returns the current render mode of the Buffer instance.
	 */
	getRenderMode() {
		return this.renderMode;
	}

	/**
	 * Returns the currently active renderer.
	 * The actual instance depends on the set render-mode.
	 * @returns {Basic|Raw} the currently active renderer instance
	 */
	getRenderer() {
		return this.renderer;
	}

	/**
	 * Sets the default clear color for the Buffer.
	 * If no arguments are given, the clear color is set to "transparent".
	 * @param {string} c CSS color string
	 */
	setClearColor(c) {
		this._clearColor = c || "transparent";
	}

	/**
	 * Returns the currently set clear color of the Buffer.
	 * Default is "transparent".
	 * <b>Exception</b>: The lowest layer at depth 0 is cleared with color "#222222"!
	 */
	getClearColor() {
		return this._clearColor;
	}

	/**
	 * Sets whether the Buffer should be cleared by the Screen class each frame.
	 * If set to false, the last rendered content will stay visible.
	 *
	 * Disabling the automatic clearing of the Buffer can be helpful if you have static
	 * background images which don't need to be rerendered each frame.
	 * @param {boolean} b
	 */
	setAutoCleared(b) {
		this._autoCleared = !!b;
	}

	/**
	 * Returns whether the Buffer should be automatically cleared by the Screen class on each frame.
	 */
	isAutoCleared() {
		return this._autoCleared;
	}

	/**
	 * Fixates the camera.
	 *
	 * @param {boolean} b whether the camera is fixed or not
	 */
	setCameraFixed(b) {
		this._cameraIsFixed = !!b;
	}

	/**
	 * Returns whether the camera is fixed or not.
	 */
	isCameraFixed() {
		return this._cameraIsFixed;
	}

	/**
	 * Move Camera of the Buffer.
	 * You can ommit the x or the y value, if you want to do a partial update,
	 * e.g. buffer.cam(undefined, 12)
	 *
	 * @param {Number} x the new x position
	 * @param {Number} y the new y position
	 */
	cam(x, y) {
		if (this._cameraIsFixed) {
			warn(`Camera is fixed for Buffer of depth ${this.depth}. Position cannot be changed to (${x}, ${y}). Call setCameraFixed(false) first.`, "GFX.Buffer");
			return;
		}

		// update single values if given
		if (x != null) {
			this.camX = -1 * x;
		}
		if (y != null) {
			this.camY = -1 * y;
		}
	}

	/**
	 * Returns the current camera values.
	 */
	getCam() {
		return {
			x: -this.camX,
			y: -this.camY
		}
	}

	/**
	 * Returns the Canvas element of the Buffer.
	 * <b>Beware:</b> Use at your own risk!
	 */
	getCanvas() {
		return this._canvasDOM;
	}

	/**
	 * Returns the rendering context of the Buffer.
	 * <b>Beware:</b> Use at your own risk!
	 */
	getContext() {
		return this._ctx;
	}
}

/**
 * The List of available render modes:
 * - Basic  (native canvas draw calls)
 * - Raw    (pixelbuffering)
 */
Buffer.RenderModes = {
	"BASIC": "BASIC",
	"RAW"  : "RAW"
};

export default Buffer;