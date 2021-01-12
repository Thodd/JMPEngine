# Backlog

---

## Open

### [ Game ] Ranged Weapons

* [x] Introduce Cursor Class
* [x] Draw Bresenham line when moving cursor
* [x] Fix Colors of bresenham line
* [x] Clamp bresenham line calculation to the max size of the view-port...
* [x] Render all "obstructed" line tiles red
* [x] Fire projectile
  * Iterate bresenham line and damage first enemy (or tile for destructive projectiles)
* [ ] Projectile Movement animation
  * Chain multiple MovementAnimations together, moving from one tile to the next in the chain
* [ ] Visualize Magazine & Additional Ammo in UI
* [ ] Introduce "pass-projectile" flag on Tile Type
  * Some tiles like water or a bush do not obstruct the targetting

### Look Command

* [ ] Include Actors & Items in the History Log-Message when looking at a tile
* [ ] Implement Look-Command via Context Menu

### Fixes

* [ ] Move HP Indicator below an Actor if they are on the top row of the Screen-Viewport
  * Otherwise the HP Indicator is rendered outside --> happens with Ranged Weapons
### UI

* [ ] Introduce Tabs for Backpack
* [ ] Visualize "Ammo" for "Consumables"

### Maps

* [ ] Teleport to new Map/Screen

### Enemies

* [ ] Wolf: Move back to spawen after the player is out of reach for a couple of turns
* [ ] Spiders:
  * Random movement if player is not around
  * Move towards player if they are close
  * Spits Webs which immobilize the player
  * Poison?
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