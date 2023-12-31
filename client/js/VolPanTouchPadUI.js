import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import VolPanDataObject from 'VolPanDataObject';
import MathUtils from 'jac/utils/MathUtils';
import FFTDataObject from "./FFTDataObject";

export default class VolPanTouchPadUI extends EventDispatcher {
    constructor($document) {
        super();

        this.doc = $document;
        this.geb = new GlobalEventBus();
        this.volPanDataObject = new VolPanDataObject();

        this.volPanTouchId = null;
        this.recenterOnTouchEnd = false;
        this.recenterOnMouseUp = false;
        this.lasButtonDown = null;
        this.thumbSize = null;
        this.thumbThickness = null;

        this.fftDO = new FFTDataObject();

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
        this.mainDiv = this.doc.getElementById('mainDiv');
        this.volPanTouchPadDiv = this.doc.getElementById('volPanTouchPadDiv');

        //Delegates
        this.requestAnimationFrameDelegate = EventUtils.bind(self, self.handleRequestAnimationFrame);
        this.mouseDownDelegate = EventUtils.bind(self, self.handleMouseDown);
        this.mouseUpDelegate = EventUtils.bind(self, self.handleMouseUp);
        this.mouseMoveDelegate = EventUtils.bind(self, self.handleMouseMove);
        this.touchStartDelegate = EventUtils.bind(self, self.handleTouchStart);
        this.touchEndDelegate = EventUtils.bind(self, self.handleTouchEnd);
        this.touchMoveDelegate = EventUtils.bind(self, self.handleTouchMove);
        this.doubleClickDelegate = EventUtils.bind(self, self.handleDoubleClick);
        this.contextMenuDelegate = EventUtils.bind(self, self.handleContextMenu);
        this.resizeEndedDelegate = EventUtils.bind(self, self.handleResizeEnded);

        //Events
        this.volPanTouchPadCanvas.addEventListener('dblclick', this.doubleClickDelegate);
        this.volPanTouchPadCanvas.addEventListener('mousedown', this.mouseDownDelegate);
        this.volPanTouchPadCanvas.addEventListener('touchstart', this.touchStartDelegate);
        this.volPanTouchPadCanvas.addEventListener('contextmenu', this.contextMenuDelegate);
        this.doc.addEventListener('touchend', this.touchEndDelegate);
        this.geb.addEventListener('resizeEnded', this.resizeEndedDelegate);

        //Setup thumb
        self.handleResizeEnded(null);

        //Kick off rendering
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    handleResizeEnded($evt) {
        //resize thumb
        this.thumbSize = Math.round(this.volPanTouchPadCanvas.width * 0.1);
        this.thumbThickness = Math.max(Math.round(this.volPanTouchPadCanvas.width * 0.06),1);
        this.thumbOffset = Math.round(this.thumbSize/2);
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

    handleDoubleClick($evt) {
        l.debug('Double Click');
        this.volPanDataObject.currentPan = 0;
        this.volPanDataObject.currentVolume = 50;
    }


    handleMouseDown($evt) {
        $evt.preventDefault();

        this.lasButtonDown = $evt.button;

        this.volPanTouchPadCanvas.addEventListener('mousemove', this.mouseMoveDelegate);
        this.doc.addEventListener('mouseup', this.mouseUpDelegate);

        if(this.lasButtonDown === 2) {
            this.recenterOnMouseUp = true;
        }

        //Force position update
        this.handleMouseMove($evt);
    }

    handleMouseUp($evt) {
        $evt.preventDefault();
        this.volPanTouchPadCanvas.removeEventListener('mousemove', this.mouseMoveDelegate);
        this.doc.removeEventListener('mouseup', this.mouseMoveDelegate);

        if(this.recenterOnMouseUp) {
            this.recenterOnMouseUp = false;
            this.volPanDataObject.currentPan = 0;
            this.volPanDataObject.currentVolume = 50;
        }
    }

    handleMouseMove($evt) {
        if(this.lasButtonDown === 0) {
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

        if($evt.touches.length > 1) {
            let touch0 = $evt.touches[0];
            let touch1 = $evt.touches[1];
            let dist = MathUtils.distanceBetween(touch0.clientX, touch1.clientX, touch0.clientY, touch1.clientY);
            l.debug('---- DIST: ', dist);
            if(dist < 400) {
                this.recenterOnTouchEnd = true;
            }
        }

        this.isTouchingOrMouseDown = true;

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

        if($evt.touches.length === 0 && this.recenterOnTouchEnd === true) {
            this.volPanDataObject.currentPan = 0;
            this.volPanDataObject.currentVolume = 50;
            this.recenterOnTouchEnd = false;
        }

        if($evt.touches.length === 0) {
            this.isTouchingOrMouseDown = false;
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

        this.volPanDataObject.currentPan = this.xCoordToPanPercent(x) * 100;
        this.volPanDataObject.currentVolume = this.yCoordToVolPercent(y) * 100;
    }

    handleRequestAnimationFrame($evt) {
        //Clear Canvas
        this.volPanTouchPadCanvasContext.clearRect(0,0,this.volPanTouchPadCanvas.width, this.volPanTouchPadCanvas.height);

        //Update Visualizer
        if(this.fftDO.fftAnalyzer) {
            this.fftDO.fftAnalyzer.getByteTimeDomainData(this.fftDO.fftDataArray);
            this.volPanTouchPadCanvasContext.beginPath();
            this.volPanTouchPadCanvasContext.strokeStyle = '#C82920';
            this.volPanTouchPadCanvasContext.lineWidth = 1;
            let canvasWidth = this.volPanTouchPadCanvas.width;
            let canvasHeight = this.volPanTouchPadCanvas.height;
            let segLength = canvasHeight / this.fftDO.fftBufferLength;
            let y = canvasHeight;
            for(let i = 0; i < this.fftDO.fftBufferLength; i++) {
                let v = (this.fftDO.fftDataArray[i] / 128.0);
                let x = (v * canvasWidth);
                x -= (canvasWidth/2);

                if(i === 0) {
                    this.volPanTouchPadCanvasContext.moveTo(x,y);
                } else {
                    this.volPanTouchPadCanvasContext.lineTo(x,y);
                }

                y -= segLength;
            }
            this.volPanTouchPadCanvasContext.stroke();
        }

        //Draw thumb
        let padWidth = this.volPanTouchPadCanvas.width;
        let padHeight = this.volPanTouchPadCanvas.height;

        let padWidthCenter = padWidth/2;
        let thumbX = ((this.volPanDataObject.currentPan / 100) * (padWidthCenter)) + padWidthCenter;
        let thumbY = padHeight - ((this.volPanDataObject.currentVolume / 100) * (padHeight));

        this.volPanTouchPadCanvasContext.strokeStyle = '#F7B541';
        this.volPanTouchPadCanvasContext.lineWidth = this.thumbThickness;
        this.volPanTouchPadCanvasContext.beginPath();
        this.volPanTouchPadCanvasContext.arc(thumbX, thumbY, this.thumbSize, 0, Math.PI * 2, false);
        this.volPanTouchPadCanvasContext.stroke();

        this.volPanTouchPadCanvasContext.fillStyle= '#F7B541';
        this.volPanTouchPadCanvasContext.beginPath();
        this.volPanTouchPadCanvasContext.arc(thumbX, thumbY, this.thumbSize/3, 0, Math.PI * 2, false);
        this.volPanTouchPadCanvasContext.fill();

        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    handleContextMenu($evt) {
        $evt.preventDefault();
    }
}