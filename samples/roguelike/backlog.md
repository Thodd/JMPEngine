# Backlog

## ideas

* Room-Structure for overworld
  * Indicator on map border where the screen can be left (arrows, doesn't cave-of-qud do something similar??? check this)
  * Room 2 Room ccrolling like in Zelda
    * Check if this feels good...
* Charaters you have not talked to will have a brighter color
  * Once you talked to a character it's color will be diminished
  * Characters who are still relevant will always be bright, e.g. Quest is not finished yet
  * Animated?
    * Blinks in 2 colors to signal an important character
* Animated tiles, simple visual change: Only flip through TileVisuals + dt
## open

* [ ] Event-Based input handling
  * Extend Keyboard class to collect events until the end of frame and then fire an Event with multiple pressed keys
  *
## done

* [x] Render RLMap
  * RLMap Viewport is defined in Tiles (NOT Pixels)
  * 2 Layers (_pixiSprite = Outer Container + 2 * PIXI.Container):
    * 1. Background (PIXI.Graphics, 1 instance, rerender BG on each "dirty" -> typically scrolling)
    * 2. Tiles/Characters
    * The Actors are rendered dynamically instead of the tile char
      * If actor background is transparent -> keep Cell BG, otherwise used Actor BG