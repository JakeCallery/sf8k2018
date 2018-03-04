//TODO: Preset "setting" doesn't work with touch

import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';
import MarkerDataObject from 'MarkerDataObject';

export default class InputManager extends EventDispatcher {
    constructor($document) {
        super();
        l.debug('New Input Manager');

        let self = this;
        this.doc = $document;
        this.geb = new GlobalEventBus();

        this.lastTouchPosDict = {};
        this.lastLoopRectTouchPos = null;

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        l.debug('Input Manager Ready');
        let self = this;

        this.startMarkerTouchId = null;
        this.endMarkerTouchId = null;
        this.loopRectTouchId = null;

        this.markerDO = new MarkerDataObject();
        this.soundCanvas = this.doc.getElementById('soundCanvas');

        //TODO: this will need reset on page width change
        this.canvasContainerDiv = this.doc.getElementById('canvasContainerDiv');
        this.soundCanvasOffsetX = this.canvasContainerDiv.offsetLeft;
        this.soundCanvasOffsetY = this.canvasContainerDiv.offsetTop;

        //Delegates
        this.mouseMoveDelegate = EventUtils.bind(self, self.handleMouseMove);
        this.mouseDownDelegate = EventUtils.bind(self, self.handleMouseDown);
        this.mouseUpDelegate = EventUtils.bind(self, self.handleMouseUp);
        this.contextMenuDelegate = EventUtils.bind(self, self.handleContextMenu);
        this.touchStartDelegate = EventUtils.bind(self, self.handleTouchStart);
        this.touchMoveDelegate = EventUtils.bind(self, self.handleTouchMove);
        this.touchEndDelegate = EventUtils.bind(self, self.handleTouchEnd);

        //Events
        this.soundCanvas.addEventListener('touchstart', this.touchStartDelegate);
        this.soundCanvas.addEventListener('touchmove', this.touchMoveDelegate);
        this.soundCanvas.addEventListener('touchend', this.touchEndDelegate);
        this.soundCanvas.addEventListener('mousemove', this.mouseMoveDelegate);
        this.soundCanvas.addEventListener('mouseup', this.mouseUpDelegate);
        this.soundCanvas.addEventListener('mousedown', this.mouseDownDelegate);
        this.soundCanvas.addEventListener('contextmenu', this.contextMenuDelegate);


        l.debug('Input Manager Sound CanvasOffset: ', this.soundCanvasOffsetX, this.soundCanvasOffsetY);

    }

    createMarkerTouchDataObj($touch, $markerX) {
        let touchX = $touch.pageX - this.soundCanvasOffsetX;

        return {
            touch: $touch,
            id: $touch.identifier,
            touchX: touchX,
            dist: Math.abs(touchX - $markerX)
        }
    }

    sortBySmallestDist($touchDataObjA, $touchDataObjB) {
        if($touchDataObjA.dist < $touchDataObjB.dist) {
            return -1;
        }

        if($touchDataObjA.dist > $touchDataObjB.dist) {
            return 1;
        }

        return 0;
    }

    handleTouchStart($evt) {
        l.debug('touch Start');
        $evt.preventDefault();

        //TODO: Should "touches" be "changedTouches" here?
        //Save touch start points:
        for(let i = 0; i < $evt.touches.length; i++) {

            let touch = $evt.touches[i];

            //TEMP
            l.debug('ClientY: ', touch.pageY);
            l.debug('PageY: ', touch.pageY);
            ////////////


            let touchY = touch.pageY - this.soundCanvasOffsetY;
            let touchId = touch.identifier.toString();
            if (!(touchId in this.lastTouchPosDict)) {
                this.lastTouchPosDict[touchId] =
                {
                    x: touch.pageX - this.soundCanvasOffsetX,
                    y: touch.pageY - this.soundCanvasOffsetY,
                };
            }
        }

        //See if we need to start dragging loop rect
        if(this.loopRectTouchId === null) {
            for(let i = 0; i < $evt.changedTouches.length; i++) {
                let touch = $evt.changedTouches[i];
                let touchY = touch.pageY - this.soundCanvasOffsetY;
                if(touchY >= this.markerDO.loopRect.y){
                    this.loopRectTouchId = touch.identifier.toString();
                    this.lastLoopRectTouchPos = touch.pageX - this.soundCanvasOffsetX;
                }
            }
        }

        //Find closest touch to Start Marker
        let startMarkerTouchDOs = [];
        if(this.startMarkerTouchId === null) {
            for (let i = 0; i < $evt.changedTouches.length; i++) {
                let touchY = $evt.changedTouches[i].pageY - this.soundCanvasOffsetY;

                //Ignore if in the loop rect
                if(touchY < this.markerDO.loopRect.y) {
                    startMarkerTouchDOs.push(
                        this.createMarkerTouchDataObj(
                            $evt.changedTouches[i],
                            this.markerDO.startMarkerX
                        )
                    );
                }
            }
            startMarkerTouchDOs.sort(this.sortBySmallestDist);
        }

        //Find closest touch to End Marker
        let endMarkerTouchDOs = [];
        if(this.endMarkerTouchId === null) {
            for (let i = 0; i < $evt.changedTouches.length; i++) {
                let touchY = $evt.changedTouches[i].pageY - this.soundCanvasOffsetY;
                if(touchY < this.markerDO.loopRect.y){
                    endMarkerTouchDOs.push(
                        this.createMarkerTouchDataObj(
                            $evt.changedTouches[i],
                            this.markerDO.endMarkerX
                        )
                    );
                }

            }
            endMarkerTouchDOs.sort(this.sortBySmallestDist);
        }
        //If same touch is closest to both, determine which touch is on the "outside" of the marker
        if(startMarkerTouchDOs.length > 0 && endMarkerTouchDOs.length > 0) {
            if(startMarkerTouchDOs[0].id === endMarkerTouchDOs[0].id) {
                //Same touch for both markers, ditch the one furthest away
                if(startMarkerTouchDOs[0].dist <= endMarkerTouchDOs[0].dist) {
                    //remove first endMarker touch
                    endMarkerTouchDOs.shift();
                } else {
                    //remove first startMarker touch
                    startMarkerTouchDOs.shift();
                }
            }
        }

        if(this.startMarkerTouchId === null && startMarkerTouchDOs.length > 0) {
            //save start marker touch id
            this.startMarkerTouchId = startMarkerTouchDOs[0].id.toString();
        }

        if(this.endMarkerTouchId === null && endMarkerTouchDOs.length > 0) {
            //save end marker touch id
            this.endMarkerTouchId = endMarkerTouchDOs[0].id.toString();
        }

        //TODO: Draw colored line from marker center to assigned touch point
        l.debug('StartMarker Touch Id: ', this.startMarkerTouchId);
        l.debug('EndMarker Touch Id: ', this.endMarkerTouchId);
    }

    handleTouchEnd($evt) {
        l.debug('touch end');
        $evt.preventDefault();

        for(let i = 0; i < $evt.changedTouches.length; i++) {
            let touch = $evt.changedTouches[i];
            let touchId = touch.identifier.toString();
            if(touchId in this.lastTouchPosDict) {
                delete this.lastTouchPosDict[touchId];
                delete this.lastTouchPosDict[touchId];
            }

            if(touchId === this.startMarkerTouchId) {
                this.startMarkerTouchId = null;
            }

            if(touchId === this.endMarkerTouchId) {
                this.endMarkerTouchId = null;
            }

            if(touchId === this.loopRectTouchId) {
                this.loopRectTouchId = null;
            }
        }

        //TEMP:
        for(let key in this.lastTouchPosDict){
            l.debug('Touch Remaining: ', key, ' : ', this.lastTouchPosDict[key]);
        }
    }

    handleTouchMove($evt) {
        //TODO: refactor to be more DRY
        for(let i = 0; i < $evt.changedTouches.length; i++) {
            let touch = $evt.changedTouches[i];
            let touchId = touch.identifier.toString();

            if(touchId === this.loopRectTouchId) {
                //drag loop rect around
                let diff = (touch.pageX - this.soundCanvasOffsetX) - this.lastLoopRectTouchPos;
                this.handleLoopRectDrag(diff);
                this.lastLoopRectTouchPos = touch.pageX - this.soundCanvasOffsetX;
            }
            if(touchId === this.startMarkerTouchId) {
                //Update Start Marker if needed
                if(touchId in this.lastTouchPosDict) {
                    let currentTouchX = touch.pageX - this.soundCanvasOffsetX;
                    let lastTouchX = this.lastTouchPosDict[touchId].x;
                    let diff = currentTouchX - lastTouchX;
                    let newX = this.markerDO.startMarkerX + diff;

                    if(newX < 0) {
                        l.debug('Capping start marker new X to 0');
                        newX = 0;
                    } else if(newX > this.soundCanvas.width) {
                        l.debug('Capping start marker new X to canvas width: ' + this.soundCanvas.width);
                        newX = this.soundCanvas.width;
                    }

                    //Update marker
                    this.markerDO.startMarkerX = newX;

                    //Update last position dict:
                    this.lastTouchPosDict[touchId].x = currentTouchX;
                    this.lastTouchPosDict[touchId].y = touch.pageY - this.soundCanvasOffsetY;

                } else {
                    //should not be here
                    l.error('Could not find startMarker touch ' + touchId + ' in lastTouchPosDict');
                }
            } else if(touchId === this.endMarkerTouchId) {
                //update end marker if needed
                if(touchId in this.lastTouchPosDict) {
                    let currentTouchX = touch.pageX - this.soundCanvasOffsetX;
                    let lastTouchX = this.lastTouchPosDict[touchId].x;
                    let diff = currentTouchX - lastTouchX;
                    let newX = this.markerDO.endMarkerX + diff;

                    if(newX < 0) {
                        l.debug('Capping end marker new X to 0');
                        newX = 0;
                    } else if(newX > this.soundCanvas.width) {
                        l.debug('Capping end marker new X to canvas width: ' + this.soundCanvas.width);
                        newX = this.soundCanvas.width;
                    }

                    //Update Marker
                    this.markerDO.endMarkerX = newX;

                    //Update last position dict
                    this.lastTouchPosDict[touchId].x = currentTouchX;
                    this.lastTouchPosDict[touchId].y = touch.pageY - this.soundCanvasOffsetY;
                } else {
                    //should not be here
                    l.error('Could not find endMarker touch ' + touchId + ' in lastTouchPosDict');
                }
            } else {
                //This touch isn't being used for markers
                l.debug('Touch not assigned to start or end marker');
            }


        }
    }

    handleMouseMove($evt) {
        this.updateFromButton($evt);
    }

    handleMouseDown($evt) {
        l.debug('Mouse Down:', $evt.buttons);
        $evt.preventDefault();
        this.lastMouseDownX = $evt.pageX - this.soundCanvasOffsetX;
        this.updateFromButton($evt);
    }

    handleMouseUp($evt) {
        l.debug('Mouse up: ', $evt.buttons);

    }

    handleContextMenu($evt){
        l.debug('Caught Context menu: preventing right click menu');
        $evt.preventDefault();
    }

    updateFromButton($evt) {
        if($evt.buttons === 1){
            l.debug('Setting Start marker to: ', $evt.pageX - this.soundCanvasOffsetX);
            this.markerDO.startMarkerX = $evt.pageX - this.soundCanvasOffsetX;
        }

        if($evt.buttons === 2){
            l.debug('Setting End marker to: ', $evt.pageX - this.soundCanvasOffsetX);
            this.markerDO.endMarkerX = $evt.pageX - this.soundCanvasOffsetX;
        }

        if($evt.buttons === 4) {
            let mouseMoveDiff = ($evt.pageX - this.soundCanvasOffsetX) - this.lastMouseDownX;
            this.handleLoopRectDrag(mouseMoveDiff);
            this.lastMouseDownX = $evt.pageX - this.soundCanvasOffsetX;
        }
    }

    handleLoopRectDrag($diff) {

        l.debug('Move Diff: ', $diff);
        l.debug('Mouse Down X: ', this.lastMouseDownX);

        let currentStartX = this.markerDO.startMarkerX;
        let currentEndX = this.markerDO.endMarkerX;

        let nextStartX = currentStartX + $diff;
        let nextEndX = currentEndX + $diff;

        if(currentStartX <= currentEndX){
            if(nextStartX <= 0){
                let diff = currentStartX - 0;
                nextStartX = currentStartX - diff;
                nextEndX = currentEndX - diff;
            } else if(nextEndX > this.soundCanvas.width){
                let diff = this.soundCanvas.width - currentEndX;
                nextStartX = currentStartX + diff;
                nextEndX = currentEndX + diff;
            }
        } else {
            //Reversed
            if(nextEndX <= 0){
                let diff = currentEndX - 0;
                nextStartX = currentStartX - diff;
                nextEndX = currentEndX - diff;
            } else if(nextStartX >= this.soundCanvas.width){
                let diff = this.soundCanvas.width - currentStartX;
                nextStartX = currentStartX + diff;
                nextEndX = currentEndX + diff;
            }
        }

        this.markerDO.startMarkerX = nextStartX;
        this.markerDO.endMarkerX = nextEndX;
    }
}