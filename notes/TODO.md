##Up Next
* styling
* Bug fixes

##Future Features
* passive event listeners?
* Sequenced and Non Sequenced Presets
  * 4 presets that can be used in a sequence (loop or continue)
  * 4 presets that are loop or pause on end
* clip upload
  * 10 sec limit? (allow for cropping?)
* record from mic
  * 10 sec limit?
  
##Bugs


##Done
* Y offset messed up when page is scrolled
  * has to do with .clientY - this.soundCanvasYOffset
* Page scrolls with middle mouse button down
* If preset it set to continue, and you click the preset, if the play head was already past ethe end of the preset, it will automatically "continue" because playhead is already beyond the end
  * possible solution would be to move the play head to the start of the preset upon selection
* Touch and hold doesn't work for setting presets with touch controls
* Mute button
* viz layer over top of base waveform (for faster clearing)
