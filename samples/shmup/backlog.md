# Backlog

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