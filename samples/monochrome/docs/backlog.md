# Backlog

---

## Open

### Important

* [ ] Fix GFX
  * [x] Characters
    * [x] 4 frames each, 2 idles frames for left/right
    * [x] transparent BG
    * [x] 18x18 sprites -> 1px border around
      * [x] Offset x/y in game by -1px
  * [x] Tiles
    * [x] Draw colored tiles
  * [ ] Enemies (GFX)
    * [ ] Bear
    * [ ] Wolf
  * [ ] Items
    * [ ] oh boy that needs some effort :D
  * [ ] Projectiles
    * [ ] Hit bush -> trigger destroy
  * [ ] Leaves
    * [ ] Missing tint
  * [ ] Tile Highlights
    * [ ] Missing tint
  * [x] Blood

### [ Game ] Ranged Weapons

* [x] Introduce Cursor Class
* [x] Draw Bresenham line when moving cursor
* [x] Fix Colors of bresenham line
* [x] Clamp bresenham line calculation to the max size of the view-port...
* [x] Render all "obstructed" line tiles red
* [x] Fire projectile
  * Iterate bresenham line and damage first enemy (or tile for destructive projectiles)
* [x] Hide Cursor on fire
  * how to do this? Chain together with animations somehow?
  * Yes: We hide the cursor on fire and show it again at the beginning of the next turn
* [x] Update Bresenham Line visualization after fire
  * If an enemy moves the line-of-sight might change (blue becomes read and vice-versa)
* [x] Projectile Movement animation
  * Chain multiple MovementAnimations together, moving from one tile to the next in the chain
* [x] Create projectile sprites for different weapons
* [x] Rotate projectile
* [ ] Visualize Magazine & Additional Ammo in UI
* [ ] Introduce "pass-projectile" flag on Tile Type
  * Some tiles like water or a bush do not obstruct the targetting

### Look Command

* [ ] Include Actors & Items in the History Log-Message when looking at a tile
* [ ] Implement Look-Command via Context Menu

### Fixes

* [ ] Move HP Indicator below an Actor if they are on the top row of the Screen-Viewport
  * Otherwise the HP Indicator is rendered outside --> happens with Ranged Weapons
* [ ] Enemy/Actor dies before the projectile hits? When is the death animation scheduled?
### UI

* [ ] Introduce Tabs for Backpack
* [ ] Visualize "Ammo" for "Consumables"?
  * is this needed???

### Maps

* [ ] Teleport to new Map/Screen

### Enemies

* [ ] Wolf: Move back to spawn after the player is out of reach for a couple of turns
* [ ] Spiders:
  * Random movement if player is not around
  * Move towards player if they are close
  * Spits Webs which immobilize the player
  * Poison?
* [ ] Elder Thing
  * [ ] Can shoots acid
* [ ] Bat
  * [ ] flys over obstacles
  * [ ] erratic movement like snake
* [ ] Cultist
  * [ ] Shoots gun
* [ ] Tentacle
  * static enemy, only hurts the player if adjacent
* [ ] Thorns
  * static enemy --> TILE!
  * only hurts the player if attacked, can be destroyed like a regular bush
* [ ] Factory-Function to create Enemies?
  * Constant class for accessing enemy types?

### Weapons

* [ ] Bombs

### Items

* [ ] Shovel :D

### Art

* [ ] **[ Art ]** Pixel new Tree

### Random

* [ ] Nothing

---

## Done

Here I will keep some interesting or more complex Items I completed.
Not necessarily all items. Smaller ones will just be deleted.

### UI

* [x] Make Map-Screen quadratic, 21x21 ???
* [x] Reorganize UI into a Grid system