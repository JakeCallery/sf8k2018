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

        //Events

        //Kick off rendering
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    handleRequestAnimationFrame($evt) {
        //Clear Canvas
        this.volPanTouchPadCanvasContext.fillStyle = '#FF00FF';
        this.volPanTouchPadCanvasContext.fillRect(0,0,this.volPanTouchPadCanvas.width, this.volPanTouchPadCanvas.height);

        //Draw thumb
        let padWidth = this.volPanTouchPadCanvas.width;
        let padHeight = this.volPanTouchPadCanvas.height;

        let padWidthCenter = padWidth/2;
        let thumbX = (this.volPanDO.currentPan / 100) * (padWidthCenter) + padWidthCenter;
        let thumbY = padHeight - ((this.volPanDO.currentVolume / 100) * (padHeight));

        this.volPanTouchPadCanvasContext.beginPath();
        this.volPanTouchPadCanvasContext.fillStyle = '#00FF00';
        this.volPanTouchPadCanvasContext.arc(thumbX, thumbY, (padWidth * 0.1), 0, Math.PI * 2, false);
        this.volPanTouchPadCanvasContext.fill();
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }
}