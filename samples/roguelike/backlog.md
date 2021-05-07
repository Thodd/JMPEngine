# Backlog

## open

* [ ] Connect Rooms in all adjacent directions
* [ ] Enrich Rooms with tile-coordinate information for scrolling via the GameController
* [ ] Explore FOV ???

* [ ] Integrate "monochrome" features into grid-based engine
  * [ ] Refactor Animation System to fit the grid based style
    * Animation instance gets: Map, Actor or Cell
  * [ ] Control-Schemes via GameController
## ideas

* [x] Room-Structure for overworld
  * [x] Room 2 Room scrolling like in Zelda

* Charaters you have not talked to will have a brighter color
  * Once you talked to a character it's color will be diminished
  * Characters who are still relevant will always be bright, e.g. Quest is not finished yet
  * Animated?
    * Blinks in 2 colors to signal an important character

* Animated tiles, simple visual change: Only flip through TileVisuals + dt

## done

* [x] Event-Based input handling
  * Extend Keyboard class to collect events until the end of frame and then fire an Event with multiple pressed keys
* [x] Render RLMap
  * RLMap Viewport is defined in Tiles (NOT Pixels)
  * 2 Layers (_pixiSprite = Outer Container + 2 * PIXI.Container):
    * 1. Background (PIXI.Graphics, 1 instance, rerender BG on each "dirty" -> typically scrolling)
    * 2. Tiles/Characters
    * The Actors are rendered dynamically instead of the tile char
      * If actor background is transparent -> keep Cell BG, otherwise used Actor BG