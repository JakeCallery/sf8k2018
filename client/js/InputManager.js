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

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        l.debug('Input Manager Ready');
        let self = this;

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

        //Events
        this.soundCanvas.addEventListener('mousemove', this.mouseMoveDelegate);
        this.soundCanvas.addEventListener('mouseup', this.mouseUpDelegate);
        this.soundCanvas.addEventListener('mousedown', this.mouseDownDelegate);
        this.soundCanvas.addEventListener('contextmenu', this.contextMenuDelegate);

        l.debug('Input Manager Sound CanvasOffset: ', this.soundCanvasOffsetX, this.soundCanvasOffsetY);

    }

    handleMouseMove($evt) {
        //l.debug('Caught mouse Move: ', $evt.buttons);
        this.updateFromButton($evt);

    }

    handleMouseDown($evt) {
        l.debug('Mouse Down:', $evt.buttons);
        this.mouseDownX = $evt.clientX - this.soundCanvasOffsetX;
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

        let nextX = this.mouseDownX + mouseMoveDiff;
        l.debug('Next X Before Processing: ', nextX);
        if(nextX < 0){
            nextX = 0;
        } else if(nextX + this.markerDO.loopRect.width > this.soundCanvas.width) {
            nextX = this.soundCanvas.width - this.markerDO.loopRect.width;
        }

        let loopRectWidth = this.markerDO.loopRect.width;
        this.markerDO.startMarkerX = nextX;
        this.markerDO.endMarkerX = this.markerDO.startMarkerX + loopRectWidth;
    }
}