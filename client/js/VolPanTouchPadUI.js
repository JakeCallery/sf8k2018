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
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }
}