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

        this.touchStartXDict = {};
        this.touchStartYDict = {};
        this.touchStartDict = {};

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        l.debug('Input Manager Ready');
        let self = this;

        this.startMarkerTouchId = null;
        this.endMarkerTouchid = null;

        this.markerDO = new MarkerDataObject();
        this.soundCanvas = this.doc.getElementById('soundCanvas');
        this.soundCanvasOffsetX = this.soundCanvas.offsetLeft;
        this.soundCanvasOffsetY = this.soundCanvas.offsetTop;
        this.isDraggingLoopRect = false;

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

    createTouchDataObj($touch, $markerX) {
        let touchX = $touch.clientX - this.soundCanvasOffsetX;
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

        //Save touch start points:
        for(let i = 0; i < $evt.touches.length; i++) {
            let touch = $evt.touches[i];
            let touchId = touch.identifier.toString();
            if (!(touchId in this.touchStartDict)) {
                this.touchStartDict[touchId] =
                    {
                        x: touch.clientX - this.soundCanvasOffsetX,
                        y: touch.clientY - this.soundCanvasOffsetY,
                    };

            }
        }

        //Find closest touch to Start Marker
        let startMarkerTouchDOs = [];

        if(this.startMarkerTouchId === null) {
            for (let i = 0; i < $evt.changedTouches.length; i++) {
                startMarkerTouchDOs.push(
                    this.createTouchDataObj(
                        $evt.changedTouches[i],
                        this.markerDO.startMarkerX
                    )
                );
            }
            startMarkerTouchDOs.sort(this.sortBySmallestDist);
        }
        //Find closest touch to End Marker
        let endMarkerTouchDOs = [];
        if(this.endMarkerTouchid === null) {
            for (let i = 0; i < $evt.changedTouches.length; i++) {
                endMarkerTouchDOs.push(
                    this.createTouchDataObj(
                        $evt.changedTouches[i],
                        this.markerDO.endMarkerX
                    )
                );
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

        if(this.endMarkerTouchid === null && endMarkerTouchDOs.length > 0) {
            //save end marker touch id
            this.endMarkerTouchid = endMarkerTouchDOs[0].id.toString();
        }

        //TODO: Draw colored line from marker center to assigned touch point
        l.debug('StartMarker Touch Id: ', this.startMarkerTouchId);
        l.debug('EndMarker Touch Id: ', this.endMarkerTouchid);
    }

    handleTouchEnd($evt) {
        l.debug('touch end');
        $evt.preventDefault();

        for(let i = 0; i < $evt.changedTouches.length; i++) {
            let touch = $evt.changedTouches[i];
            let touchId = touch.identifier.toString();
            if(touchId in this.touchStartDict) {
                delete this.touchStartDict[touchId];
                delete this.touchStartDict[touchId];
            }

            if(touchId === this.startMarkerTouchId) {
                this.startMarkerTouchId = null;
            }

            if(touchId === this.endMarkerTouchid) {
                this.endMarkerTouchid = null;
            }
        }

        //TEMP:
        for(let key in this.touchStartDict){
            l.debug('Touch Remaining: ', key, ' : ', this.touchStartDict[key]);
        }
    }

    handleTouchMove($evt) {

    }

    handleMouseMove($evt) {
        this.updateFromButton($evt);
    }

    handleMouseDown($evt) {
        l.debug('Mouse Down:', $evt.buttons);
        this.mouseDownX = $evt.clientX - this.soundCanvasOffsetX;
        this.markerDO.saveCurrentLocations();
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
            l.debug('Setting Start marker to: ', $evt.clientX - this.soundCanvasOffsetX);
            this.markerDO.startMarkerX = $evt.clientX - this.soundCanvasOffsetX;
        }

        if($evt.buttons === 2){
            l.debug('Setting End marker to: ', $evt.clientX - this.soundCanvasOffsetX);
            this.markerDO.endMarkerX = $evt.clientX - this.soundCanvasOffsetX;
        }

        if($evt.buttons === 4) {
            this.loopRectMouseDownOffsetX =  this.mouseDownX - this.markerDO.loopRect.x;
            this.handleLoopRectDrag($evt);
        }
    }

    handleLoopRectDrag($evt) {
        let mouseMoveDiff = ($evt.clientX - this.soundCanvasOffsetX) - this.mouseDownX;
        l.debug('Move Diff: ', mouseMoveDiff);
        l.debug('Mouse Down X: ', this.mouseDownX);

        let origStartX = this.markerDO.startMarkerXOrig;
        let origEndX = this.markerDO.endMarkerXOrig;

        let currentStartX = this.markerDO.startMarkerX;
        let currentEndX = this.markerDO.endMarkerX;

        let nextStartX = origStartX + mouseMoveDiff;
        let nextEndX = origEndX + mouseMoveDiff;

        if(origStartX <= origEndX){
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