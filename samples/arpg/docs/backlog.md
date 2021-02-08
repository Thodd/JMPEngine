# Todo

# Gameplay

* [ ] Hearts
* [ ] Text-Box System
* [ ] Enemies
  * [x] Rener initial Enemy
  * [x] Make Map-Object Types sanity check --> similar to tile-types in Tileset.js
    * Is each Enemy a separate type?
    * Or just 1 type == Enemy, and then spawn different kinds of enemy based on some random logic (e.g. distance to spawn, player weapon progression -> stronger weapon == stronger enemies?)
  * [x] Walk around randomly
  * [x] Hurt by Slash
    * [x] Knockback
  * [ ] Hurts player on touch
* [ ] Attacks
  * [ ] Decouple Attack class from Actor class
    * Only relevant function --> getClosestTile
* [ ] Weapons
  * [ ] Make Sword an item
  * [x] New Weapon Item: Spear
* [ ] Swimming
  * [ ] Always allow swimming, skip 1 frame (so its slow)
  * [ ] Swim-Training -> faster swimming
  * [ ] Diving ???
* [ ] Inventory System
  * [ ] Equip different items/weapons
* [ ] Tilebased Effects for NPCs
  * [ ] Introduce a Pool, and just take an effect from the pool if an Actor is on a grass/shallow_water tile
* [ ] Refactor "SmallEffect" to a Pool
  * [ ] Keep effect instances in the Screen and not remove them after the Animation is finished
* [x] Refactor Animation handling for slashing etc.
  * [x] Make Sword visible again
    * Add Sword animation frames to the nextPosition -> Update
  * Should be easier in the end to maintain

### Art

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

### Mapgen

* [ ] Tunnel from one room to another (?)
* [ ] Track Objects/Actors/Enemies in a Room
* [ ] Reset a Room when the player is 1 Room away
  * [ ] Reset = Respawn Enemies, Grass, Bushes, ...
* [x] First draft for Island overworld generation