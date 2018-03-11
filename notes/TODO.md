##Up Next
* styling
 * switch button fonts to svg for better sizing control
* Bug fixes
* Add Feature Check for StereoPannerNode
* Preloader

##Future Features
* warn if width is too narrow
* passive event listeners?
* pan lock / vol lock (for use with touch pad)
* Sequenced and Non Sequenced Presets
  * 4 presets that can be used in a sequence (loop or continue)
  * 4 presets that are loop or pause on end
* clip upload
  * 10 sec limit? (allow for cropping?)
* record from mic
  * 10 sec limit?
  
##Bugs
* while holding mute button down, can't switch preset modes
  * multi-touch issue

##Done
* Y offset messed up when page is scrolled
  * has to do with .clientY - this.soundCanvasYOffset
* Page scrolls with middle mouse button down
* If preset it set to continue, and you click the preset, if the play head was already past ethe end of the preset, it will automatically "continue" because playhead is already beyond the end
  * possible solution would be to move the play head to the start of the preset upon selection
* Touch and hold doesn't work for setting presets with touch controls
* Mute button
* viz layer over top of base waveform (for faster clearing)
* replace range slider with "touch pad" controlling vol and pan?
* can accidentally change markers if mouse is down and dragging over soundcanvas even if mouse wasn't down on canvas to start with
* Layout Manager (initial layout to start)
  * Handle Window Resizes
* max size (or just max height) on mute button
* scale sound canvas height
* fix vertical spacing on controls
* figure out what to do about a full screen button
* double click/tap to recenter vol/pan
