##Up Next
* Mute button
* Bug fixes
* viz layer over top of base waveform (for faster clearing)
* styling

##Bugs
* Touch and hold doesn't work for setting presets with touch controls




##Done
* Y offset messed up when page is scrolled
  * has to do with .clientY - this.soundCanvasYOffset

* Page scrolls with middle mouse button down

* If preset it set to continue, and you click the preset, if the play head was already past ethe end of the preset, it will automatically "continue" because playhead is already beyond the end
  * possible solution would be to move the play head to the start of the preset upon selection
