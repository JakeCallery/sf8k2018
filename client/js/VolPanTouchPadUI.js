import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import VolPanDataObject from 'VolPanDataObject';

export default class VolPanTouchPadUI extends EventDispatcher {
    constructor($document) {
        super();

        this.doc = $document;
        this.volPanDO = new VolPanDataObject();

        this.volPanTouchId = null;

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        let self = this;

        //Elements
        this.volPanTouchPadCanvas = this.doc.getElementById('volPanTouchPadCanvas');
        this.volPanTouchPadCanvasContext = this.volPanTouchPadCanvas.getContext('2d');

        //Delegates
        this.requestAnimationFrameDelegate = EventUtils.bind(self, self.handleRequestAnimationFrame);
        this.mouseDownDelegate = EventUtils.bind(self, self.handleMouseDown);
        this.mouseUpDelegate = EventUtils.bind(self, self.handleMouseUp);
        this.mouseMoveDelegate = EventUtils.bind(self, self.handleMouseMove);
        this.touchStartDelegate = EventUtils.bind(self, self.handleTouchStart);
        this.touchEndDelegate = EventUtils.bind(self, self.handleTouchEnd);
        this.touchMoveDelegate = EventUtils.bind(self, self.handleTouchMove);

        //Events
        this.volPanTouchPadCanvas.addEventListener('mousedown', this.mouseDownDelegate);
        this.volPanTouchPadCanvas.addEventListener('touchstart', this.touchStartDelegate);
        this.doc.addEventListener('touchend', this.touchEndDelegate);

        //Kick off rendering
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    yCoordToVolPercent($y) {
        let diff = this.volPanTouchPadCanvas.height - $y;
        let percent = diff / this.volPanTouchPadCanvas.height;
        return percent;
    }

    xCoordToPanPercent($x) {
        let halfWidth = this.volPanTouchPadCanvas.width / 2;
        let percent = null;

        if($x <= halfWidth) {
            let diff = halfWidth - $x;
            percent = diff / halfWidth * -1;
        } else {
            let diff = $x - halfWidth;
            percent = diff / halfWidth;
        }

        return percent;

    }

    handleMouseDown($evt) {
        $evt.preventDefault();
        l.debug('Down Delegate: ', this.mouseMoveDelegate);
        this.volPanTouchPadCanvas.addEventListener('mousemove', this.mouseMoveDelegate);
        this.doc.addEventListener('mouseup', this.mouseUpDelegate);
    }

    handleMouseUp($evt) {
        $evt.preventDefault();
        l.debug('Delegate: ', this.mouseMoveDelegate);
        this.volPanTouchPadCanvas.removeEventListener('mousemove', this.mouseMoveDelegate);
        this.doc.removeEventListener('mouseup', this.mouseMoveDelegate);
    }

    handleMouseMove($evt) {
        if($evt.buttons === 1) {
            this.changeVolPanFromPageLocation($evt.pageX, $evt.pageY);
        }
    }

    handleTouchStart($evt) {
        $evt.preventDefault();

        if(this.volPanTouchId === null) {
            this.volPanTouchId = $evt.changedTouches[0].identifier.toString();
            this.volPanTouchPadCanvas.addEventListener('touchmove', this.touchMoveDelegate);
            this.handleTouchMove($evt)
        }

    }

    handleTouchEnd($evt) {
        l.debug('TouchPad Touch End');
        for(let i = 0; i < $evt.changedTouches.length; i++) {
            let touch = $evt.changedTouches[i];
            if(touch.identifier.toString() === this.volPanTouchId) {
                this.volPanTouchId = null;
                this.volPanTouchPadCanvas.removeEventListener('touchmove', this.touchMoveDelegate);
                break;
            }
        }
    }

    handleTouchMove($evt) {
         for(let i = 0; i < $evt.changedTouches.length; i++) {
             let touch = $evt.changedTouches[i];
             if(touch.identifier.toString() === this.volPanTouchId) {
                 this.changeVolPanFromPageLocation(touch.pageX, touch.pageY);
                 break;
             }
         }
    }

    changeVolPanFromPageLocation($pageX, $pageY) {
        let x = $pageX - this.volPanTouchPadCanvas.offsetLeft;
        let y = $pageY - this.volPanTouchPadCanvas.offsetTop;

        this.volPanDO.currentPan = this.xCoordToPanPercent(x) * 100;
        this.volPanDO.currentVolume = this.yCoordToVolPercent(y) * 100;
    }

    handleRequestAnimationFrame($evt) {
        //Clear Canvas
        this.volPanTouchPadCanvasContext.fillStyle = '#FF00FF';
        this.volPanTouchPadCanvasContext.fillRect(0,0,this.volPanTouchPadCanvas.width, this.volPanTouchPadCanvas.height);

        //Draw thumb
        let padWidth = this.volPanTouchPadCanvas.width;
        let padHeight = this.volPanTouchPadCanvas.height;

        let padWidthCenter = padWidth/2;
        let thumbX = ((this.volPanDO.currentPan / 100) * (padWidthCenter)) + padWidthCenter;
        let thumbY = padHeight - ((this.volPanDO.currentVolume / 100) * (padHeight));

        this.volPanTouchPadCanvasContext.beginPath();
        this.volPanTouchPadCanvasContext.fillStyle = '#00FF00';
        this.volPanTouchPadCanvasContext.arc(thumbX, thumbY, (padWidth * 0.1), 0, Math.PI * 2, false);
        this.volPanTouchPadCanvasContext.fill();
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }
}