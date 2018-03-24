import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import VolPanDataObject from 'VolPanDataObject';
import MathUtils from 'jac/utils/MathUtils';
import thumbPath from '../assets/images/TouchPadThumb.svg';
import FFTDataObject from "./FFTDataObject";
import BiQuadDataObject from "./BiQuadDataObject";

export default class VolPanTouchPadUI extends EventDispatcher {
    constructor($document) {
        super();

        this.doc = $document;
        this.volPanDO = new VolPanDataObject();

        this.volPanTouchId = null;
        this.recenterOnTouchEnd = false;
        this.recenterOnMouseUp = false;
        this.isTouchingOrMouseDown = false;

        this.fftDO = new FFTDataObject();
        this.biQuadDO = new BiQuadDataObject();

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
        this.thumbImageLoadedDelegate = EventUtils.bind(self, self.handleThumbImageLoaded);

        //Events
        this.volPanTouchPadCanvas.addEventListener('dblclick', this.doubleClickDelegate);
        this.volPanTouchPadCanvas.addEventListener('mousedown', this.mouseDownDelegate);
        this.volPanTouchPadCanvas.addEventListener('touchstart', this.touchStartDelegate);
        this.volPanTouchPadCanvas.addEventListener('contextmenu', this.contextMenuDelegate);
        this.doc.addEventListener('touchend', this.touchEndDelegate);


        //Setup thumb
        this.isThumbLoaded = false;
        this.thumbCanvas = this.doc.createElement('canvas');
        this.thumbCanvasCtx = this.thumbCanvas.getContext('2d');
        this.thumbSize = Math.round(this.volPanTouchPadCanvas.width * 0.25);
        this.thumbOffset = Math.round(this.thumbSize/2);
        this.thumbImage = new Image(this.thumbSize, this.thumbSize);
        //hack for ios safari, image data is empty until its on the DOM
        //so displaying in a hidden state for now
        this.thumbImage.style['display'] = 'none';
        this.thumbImageData = null;
        this.thumbImage.src = thumbPath;
        this.thumbImage.addEventListener('load', this.thumbImageLoadedDelegate);

        //Kick off rendering
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    handleThumbImageLoaded($e) {
        l.debug('************* Caught Thumb Image Loaded: ', this.thumbSize);
        this.isThumbLoaded = true;
        this.thumbCanvasCtx.drawImage(this.thumbImage, 0, 0, this.thumbSize, this.thumbSize);
        this.thumbImageData = this.thumbCanvasCtx.getImageData(0,0,this.thumbSize,this.thumbSize);
        this.mainDiv.appendChild(this.thumbImage);
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
        this.volPanDO.currentPan = 0;
        this.volPanDO.currentVolume = 50;
    }


    handleMouseDown($evt) {
        l.debug('Buttons: ', $evt.buttons);
        $evt.preventDefault();
        this.volPanTouchPadCanvas.addEventListener('mousemove', this.mouseMoveDelegate);
        this.doc.addEventListener('mouseup', this.mouseUpDelegate);

        if($evt.buttons === 2) {
            this.recenterOnMouseUp = true;
        } else {
            this.isTouchingOrMouseDown = true;
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
            this.volPanDO.currentPan = 0;
            this.volPanDO.currentVolume = 50;
        }

        if($evt.buttons === 0) {
            this.isTouchingOrMouseDown = false;
        }
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
            this.volPanDO.currentPan = 0;
            this.volPanDO.currentVolume = 50;
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

        this.volPanDO.currentPan = this.xCoordToPanPercent(x) * 100;
        this.volPanDO.currentVolume = this.yCoordToVolPercent(y) * 100;
    }

    handleRequestAnimationFrame($evt) {
        //Clear Canvas
        //this.volPanTouchPadCanvasContext.fillStyle = '#0e125c';
        this.volPanTouchPadCanvasContext.clearRect(0,0,this.volPanTouchPadCanvas.width, this.volPanTouchPadCanvas.height);

        //Update BiQuad filter
        if(this.biQuadDO.filter) {
            if(this.volPanDO.currentPan <= 0) {
                //LowPass
                this.biQuadDO.filter.type = 'lowpass';

                // Clamp the frequency between the minimum value (40 Hz) and half of the
                // sampling rate.
                let minValue = 40;
                let maxValue = this.biQuadDO.audioContext.sampleRate / 2;
                let padVal = 1.0 - (Math.abs(this.volPanDO.currentPan) / 100);

                // Logarithm (base 2) to compute how many octaves fall in the range.
                let numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;

                // Compute a multiplier from 0 to 1 based on an exponential scale.
                let multiplier = Math.pow(2, numberOfOctaves * (padVal - 1.0));

                // Get back to the frequency value between min and max.
                this.biQuadDO.filter.frequency.value = maxValue * multiplier;

                //Set up Q (more peak near the edge of the pad) (Multiplier of 100 is nuts!)
                this.biQuadDO.filter.Q.value = (Math.abs(this.volPanDO.currentPan) / 100) * 45;
                //this.biQuadDO.filter.Q.value = padVal * 30;

            } else {
                //HighPass
                this.biQuadDO.filter.type = 'highpass';
            }
        }

        //Update Visualizer
        if(this.fftDO.fftAnalyzer) {
            this.fftDO.fftAnalyzer.getByteTimeDomainData(this.fftDO.fftDataArray);
            this.volPanTouchPadCanvasContext.strokeStyle = '#C82920';
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
        let thumbX = ((this.volPanDO.currentPan / 100) * (padWidthCenter)) + padWidthCenter;
        let thumbY = padHeight - ((this.volPanDO.currentVolume / 100) * (padHeight));

        this.volPanTouchPadCanvasContext.beginPath();
        this.volPanTouchPadCanvasContext.fillStyle = '#c9be17';

/*
        if(this.isTouchingOrMouseDown) {
            //vert line
            this.volPanTouchPadCanvasContext.fillRect(thumbX - 1, 0, 3, padHeight);
            l.debug('thumbX: ', thumbX - 1, padHeight);
            //horiz line
            this.volPanTouchPadCanvasContext.fillRect(0, thumbY - 1, this.volPanTouchPadCanvas.width, 3);
        }
*/

        if(this.isThumbLoaded === true) {
            this.volPanTouchPadCanvasContext.putImageData(this.thumbImageData, thumbX - this.thumbOffset, thumbY - this.thumbOffset);
        }
        /*
        this.volPanTouchPadCanvasContext.strokeStyle = '#5e5e5e';
        this.volPanTouchPadCanvasContext.lineWidth = 2;
        this.volPanTouchPadCanvasContext.arc(thumbX, thumbY, (padWidth * 0.1), 0, Math.PI * 2, false);
        this.volPanTouchPadCanvasContext.fill();
        this.volPanTouchPadCanvasContext.stroke();
        */

        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    handleContextMenu($evt) {
        $evt.preventDefault();
    }
}