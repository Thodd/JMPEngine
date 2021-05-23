# Backlog

## open

* [ ] UI: Player HP

* [ ] Refactor Control-Schemes from OverworldController

* [ ] NPCs
  * [x] First enemy: Rat
    * [x] randomly walk around
    * [x] attack another actor/player
    * [x] be attacked by other actor
  * [ ] rabbid dog
  * [ ] Thing
    * [ ] Strong and slow
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

* [ ] Sanity-Check for ALL manually defined things:
  * [ ] e.g. TileTypes, TileVisuals, Flavor-Texts, ...

* [ ] Drop-Loot --> DropSystem instance per RLMap --> fire "drop" event, deregister on screen switch.

## ideas

* Lightsource -> Flashlight
  * Player has a hidden counter
    * Random Event: after a random amount of turns, the flashlight looses power
      * this recovers after a couple of turns
      * spawns monsters close by
  * If the battery runs out, the visible circle is only ~3 tiles
    * Sanity suffers?

* Red herring items
  * seem important, but are useless
  * only 1 or 2 per game

* Charaters you have not talked to will have a brighter color
  * Once you talked to a character it's color will be diminished
  * Characters who are still relevant will always be bright, e.g. Quest is not finished yet
  * Animated?
    * Blinks in 2 colors to signal an important character

* Animated tiles, simple visual change: Only flip through TileVisuals + dt

## done

* [x] UI: Log
  * Event-based
  * Makes debugging a bit easier, "who hits who", "who misses", item pickups etc.

* [x] items & weapons (actors in the grid)
  * [x] ItemBase.js in /engine/actors/...
  * [x] render items
  * [x] pick-up into backpack

* [x] Melee battle
  * [x] --> needs Inventory/Backpack first
  * [x] deal damage & take damage
  * [x] attack/hurt animation

* [x] Special Player actor -> /gamecontent
  * [x] extends ActorBase
  * [x] overwrites getSats() and getBackpack()
  * [x] references satic PlayerState -> /gamecontent

* [x] Backpack/Inventory
  * [x] ItemType -> base class for all items
  * [x] Give Backpack to ActorBase.js
  * [x] Equip initial Weapons

* [x] Re-think: Project restructuring (again)
  * /engine contains base classes
  * /gamecontent contains special sub-classes
  * [x] Overworld/OverworldController -> toplevel
  * [x] EquipmentSlots & ItemCategories -> /engine
  * [x] Tiling
    * [x] Tile Class stays in -> /engine
    * [x] TileType base class (similar to ItemType) -> /engine
    * [x] Move tile-types & visuals to -> /gamecontent
      * [x] Use a factory approach like with ItemType
  * [x] Move "Constants" -> /gamecontent
  * [x] Move "Colors" -> /gamecontent

* [x] Restructure project
  * [x] core (clubs)
  * [x] game engine (spades)
    * [x] Base classes: ActorBase, Equipment/Inventory, BattleCalculator
      * e.g. Enemies, Items, Levelgen ...
  * [x] game content (diamonds)
  * [x] screen (hearts)

* [x] Refactor Animation System to fit the grid based style
  * [x] Test system
* [x] Simple FOV based on Bresenham's line algorithm
* [x] Make first "random walking NPC" possible
* [x] Room-Structure for overworld
  * [x] Room 2 Room scrolling like in Zelda
  * [x] scrolling implementation
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