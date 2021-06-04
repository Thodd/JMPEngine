# todo

* [ ] Fence Sprites
* [ ] Tunnel
  * [ ] Alternate colors -> Lights on top
* [ ] Goal Flag
  * [ ] Particle Effect, Confetti
* [ ] Parallax Scrolling for Background
  * [ ] Add a moon?
  * [ ] Stars ?
  * [ ] Hills or Houses?
* [ ] Start Screen
* [ ] Signs to show you the next curve/chicane --> based on the next visible segments (?)
* [ ] Sound
* [ ] Music

## done

* [x] HUD
* [x] ParticleEmitter in core Engine package
* [x] dust animation on wheels
  * [x] dirt when off road
  * [x] sparks on the bottom
* [x] Only switch car "left/right" sprite when in a chicane (based on centrifugal force?)
  * [x] No changes on a straight (segment.curve == 0)
  * [x] Check curve -> if > 1.5 change sprite
* [x] More different Billboards
* [x] Wheel movement animation
* [x] End Screen
  * [x] Slowly decel after finish --> key input abklemmen (this.finished)

## ideas

* Pseudo 3D flat racing game, no ground, just offroad/dirt/desert ?
* Sprites change position and scaling depending on player x/y/z