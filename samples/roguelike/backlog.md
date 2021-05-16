# Backlog

## open

* [ ] NPCs
  * [ ] First enemy: Snake
    * [x] randomly walk around
    * [ ] be attacked by other actor
    * [ ] attack another actor
  * [ ] Wolf
  * [ ] Bear
  * [ ] Firefly (casts light around itself 1 tile radius)
    * [ ] Lightsource
      * [ ] An actor can carry a light-source which illuminates their surroundings
    * friendly, cannot be attacked
    * doesn't block the player

* [ ] Make minimap switch places
  * [ ] Make it "toggleable" (is this correct?)

* [ ] Pad the World-Room map with 1 tile of mountains around it
  * Right now it can happen that the valid rooms are generated to the border :(
  * This can also be used to make nicer outlines for the forest/island edge (see ARPG generation)

* [x] TileTypes
  * [ ] Move Sanity-Check to a separate tool which cross checks ALL manually defined things:
    * [ ] e.g. TileTypes, TileVisuals, Flavor-Texts, ...

* [ ] Drop-Loot --> DropSystem instance per RLMap --> fire "drop" event, deregister on screen switch.

* [ ] Integrate "monochrome" features into grid-based engine
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

* [x] Refactor Animation System to fit the grid based style
  * [x] Test system
* [x] Simple FOV based on Bresenham's line algorithm
* [x] Make first "random walking NPC" possible
* [x] Scrolling
* [x] Collision
* [x] Make Actor move by changing x/y properties
* [x] endPlayerTurn --> Make it an event fired on the global event-bus
* [x] RLActors need a **Stats** object for timeline handling (speed, energy, ...)
* [x] Connect Rooms in all adjacent directions
* [x] Enrich Rooms with tile-coordinate information for scrolling via the GameController
* [x] Event-Based input handling
  * Extend Keyboard class to collect events until the end of frame and then fire an Event with multiple pressed keys
* [x] Render RLMap
  * RLMap Viewport is defined in Tiles (NOT Pixels)
  * 2 Layers (_pixiSprite = Outer Container + 2 * PIXI.Container):
    * 1. Background (PIXI.Graphics, 1 instance, rerender BG on each "dirty" -> typically scrolling)
    * 2. Tiles/Characters
    * The Actors are rendered dynamically instead of the tile char
      * If actor background is transparent -> keep Cell BG, otherwise used Actor BG