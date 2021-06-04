# Backlog

## ideas

* Green-Tongue
  * Simple enemy, moves from above
  * sways left and right a little
* Green Swirl
  * Moves in a circular pattern from the top
* Squid
  * Swims in from behind
* Eye
  * Stationary
  * shoots bullets towards you
* Pill-Guy
  * Randomly throws bullets at you, all angles
  * hands sway a little
* Black Skull
  * comes from the top
  * Shoots laser-beam at you when on the same X coordinate
* Cucumber
  * slams you left/right when on same Y coordinate
* Fire
  * stationary
  * cannot be killed
  * hurts on contact
## open

* [ ] Starfield BG effect

## done

* [x] Enemy Hurt animation when hit + iv-frames
* [x] Frame Events on Screen class
* [x] Move ParticleEmitter to Engine package
* [x] Particle Emitter features
  * [x] Define Particle Style ONCE during constructor
    * [x] emit({x, y}) only applies to the initial particle config
  * [x] Option: looping -> amount = max number of particles, keeps looping
    * No option, can be done with frame-event interval
  * [x] Option: 'from/to spawn angle' configuration -> default from: 0, to: 360
  * [x] Performance optimization for emitter
    * [x] Pool particle objects