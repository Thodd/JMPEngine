# Backlog

* [ ] Render RLMap
  * RLMap Viewport is defined in Tiles (NOT Pixels)
  * 2 Layers (_pixiSprite = Outer Container + 2 * PIXI.Container):
    * 1. Background (PIXI.Graphics, 1 instance, rerender BG on each "dirty" -> typically scrolling)
    * 2. Tiles/Characters
    * The Actors are rendered dynamically instead of the tile char
      * If actor background is transparent -> keep Cell BG, otherwise used Actor BG