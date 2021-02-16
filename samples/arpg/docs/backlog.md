# Engine and Gameplay

* [ ] General Item Drop system
  * [ ] Trigger on destroy of tile
  * [ ] Trigger on death of Enemies
  * [x] Use internal ItemPool
    * Keep or remove Iiem Entities??? : Hearts, Gold and Ammo will be reused anyway...
  * [x] First Item type: HEART -> restore HP.
  * [x] dropItemsOnTile(t:GameTile)
  * [x] dropItemAt(x:int, y:int)
---
* [ ] Text-Box System
---
* [ ] Weapons
  * [ ] Make Sword an item
  * [x] New Weapon Item: Spear
---
* [ ] Swimming
  * [ ] Always allow swimming, skip 1 frame (so its slow)
  * [ ] Swim-Training -> faster swimming
  * [ ] Diving ???
---
* [ ] Inventory System
  * [ ] Equip different items/weapons
---
* [ ] Tilebased Effects for NPCs
  * [ ] Introduce a Pool, and just take an effect from the pool if an Actor is on a grass/shallow_water tile
---
* [ ] Refactor "SmallEffect" to a Pool
  * [ ] Keep effect instances in the Screen and not remove them after the Animation is finished
  * [ ] Code the destroy effect-type into the Tileset, e.g. destroy_effect_type = "leaves"
---
## done
* [x] Hearts
---
* [x] Enemies
  * [x] Rener initial Enemy
  * [x] Make Map-Object Types sanity check --> similar to tile-types in Tileset.js
    * Is each Enemy a separate type?
    * Or just 1 type == Enemy, and then spawn different kinds of enemy based on some random logic (e.g. distance to spawn, player weapon progression -> stronger weapon == stronger enemies?)
  * [x] Walk around randomly
  * [x] Hurt by Slash
    * [x] Knockback
    * [x] Make Knockback better --> respect center of hitbox not top-level pixel
    * [x] Make IV-Frames configurable for each Actor
  * [x] Hurts player on touch
---
* [x] Refactor Animation handling for slashing etc.
  * [x] Make Sword visible again
    * Add Sword animation frames to the nextPosition -> Update
  * Should be easier in the end to maintain
---
* [x] Introduce destroy() function to GameTile class
  * [x] Now in Attack.js -> move to GameTile
  * Makes for an easier "drop-rate" implementation
---
* [x] Refactor TileType handling
  * [x] Remove information from Tileset
    * no parsing needed
  * [x] Define tile properties in TileTypes class
  * [x] Remove calls to Tileset.getProperties
    * Access TileTypes instead
---

# Art

* [ ] Shadows left/right of cliff-platforms ???
* [ ] Shallow  2  Deep Water Edges
* [ ] Stones in water
* [ ] Gravestones
* [ ] New Stone Wall
* [ ] Waterfalls
* [ ] New additional trees
  * [ ] Palm tree
  * [ ] "tangly" tree with vines going to the bottom
  * [ ] Additional 2x1 tall tree, like a pine tree
* [ ] Pillars
* [ ] Desert Bush (Cactus?)
* [x] Redesign Mountains and hills (less Z-like)
* [x] Walkable planks -> stilts in water (like for Adventure tileset?)
* [x] Make new fence tiles connected by planks
* [x] Move Mountain Tiles to the right
  * [x] Brown/Sandy Mountain Top (in addition to the grass)
  * [x] Try different rock style for the bottom part

# Mapgen

* [ ] Tunnel from one room to another (?)
* [ ] Track Objects/Actors/Enemies in a Room
* [ ] Reset a Room when the player is 1 Room away
  * [ ] Reset = Respawn Enemies, Grass, Bushes, ...
* [x] First draft for Island overworld generation