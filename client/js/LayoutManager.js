import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';
import verge from "./verge/verge";
import DOMUtils from "./jac/utils/DOMUtils";
import GlobalDataObject from "./GlobalDataObject";

export default class LayoutManager extends EventDispatcher {
    constructor($document, $window) {
        super();
        let self = this;
        this.doc = $document;
        this.window = $window;
        this.geb = new GlobalEventBus();
        this.globalDO = new GlobalDataObject();

        this.canvasSizeMaxRatio = 0.75;
        this.blurCanvas = null;

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

    }

    init() {
        let self = this;

        this.mainContainerDiv = this.doc.getElementById('mainContainerDiv');
        this.mainDiv = this.doc.getElementById('mainDiv');

        //Adjust canvas size based on screensize
        this.canvasContainerDiv = this.doc.getElementById('canvasContainerDiv');
        this.waveCanvas = this.doc.getElementById('waveCanvas');
        this.cleanWaveCanvas = this.doc.getElementById('cleanWaveCanvas');
        this.soundCanvas = this.doc.getElementById('soundCanvas');
        this.canvasBlendLayer = this.doc.getElementById('canvasBlendLayer');

        this.leftControlsDiv = this.doc.getElementById('leftControlsDiv');
        this.rightControlsDiv = this.doc.getElementById('rightControlsDiv');

        this.leftControlsTopRowDiv = this.doc.getElementById('leftControlsTopRowDiv');
        this.muteButton = this.doc.getElementById('muteButton');
        this.playButton = this.doc.getElementById('playButton');

        this.presetDiv = this.doc.getElementById('presetDiv');
        this.presetButtons = this.doc.getElementsByClassName('presetButton');

        this.modeDiv = this.doc.getElementById('modeDiv');
        this.modeButtons = this.doc.getElementsByClassName('modeButton');

        this.volPanTouchPadDiv = this.doc.getElementById('volPanTouchPadDiv');
        this.volPanTouchPadCanvas = this.doc.getElementById('volPanTouchPadCanvas');

        this.fullscreenButton = this.doc.getElementById('fullScreenButton');

        //Delegates
        this.resizeStartDelegate = EventUtils.bind(self, self.handleResizeStart);
        this.resizeEndDelegate = EventUtils.bind(self, self.handleResizeEnd);
        this.resizingDelegate = EventUtils.bind(self, self.handleResizing);

        //Events
        this.geb.addEventListener('resizeStarted', this.resizeStartDelegate);
        this.geb.addEventListener('resizing', this.resizingDelegate);
        this.geb.addEventListener('resizeEnded', this.resizeEndDelegate);

        this.adjustLayout();

    }

    handleResizeStart($evt) {
        l.debug('Layout Manager Caught Resize Start');
        this.mainDiv.style['filter'] = 'blur(20px)';
    }

    handleResizing($evt) {
        this.adjustLayout();
    }

    handleResizeEnd($evt) {
        l.debug('Layout Manager Caught Resize End');
        this.mainDiv.style['filter'] = null;
        this.adjustLayout();
    }

    adjustLayout() {
        let viewportWidth = verge.viewportW();
        let viewportHeight = verge.viewportH();

        let canvasWidth = Math.round(0.65 * viewportWidth);
        let canvasHeight = viewportHeight;

        //limit height by ratio
        let maxHeightByRatio = Math.round(canvasWidth * this.canvasSizeMaxRatio);
        if(canvasHeight > maxHeightByRatio) {
            canvasHeight = maxHeightByRatio;
        }


        let leftControlsWidth = Math.round(0.15 * viewportWidth);
        let rightControlsWidth = Math.round(0.20 * viewportWidth);

        this.leftControlsDiv.style['width'] = leftControlsWidth + 'px';
        this.rightControlsDiv.style['width'] = rightControlsWidth + 'px';

        this.canvasContainerDiv.style['width'] = canvasWidth + 'px';
        this.canvasContainerDiv.style['height'] = canvasHeight + 'px';

        this.waveCanvas.width = canvasWidth;
        this.waveCanvas.height = canvasHeight;

        this.cleanWaveCanvas.width = canvasWidth;
        this.cleanWaveCanvas.height = canvasHeight;

        this.soundCanvas.width = canvasWidth;
        this.soundCanvas.height = canvasHeight;

        this.canvasBlendLayer.width = canvasWidth;
        this.canvasBlendLayer.height = canvasHeight;

        this.waveCanvas.style['width'] = canvasWidth + 'px';
        this.waveCanvas.style['height'] = canvasHeight + 'px';

        this.cleanWaveCanvas.style['width'] = canvasWidth + 'px';
        this.cleanWaveCanvas.style['height'] = canvasHeight + 'px';

        this.soundCanvas.style['width'] = canvasWidth + 'px';
        this.soundCanvas.style['height'] = canvasHeight + 'px';

        this.canvasBlendLayer.style['width'] = canvasWidth + 'px';
        this.canvasBlendLayer.style['height'] = canvasHeight + 'px';

        this.globalDO.lowerAreaY = this.waveCanvas.height - (this.waveCanvas.height / 4);
        l.debug('LowerAreaY: ' + this.globalDO.lowerAreaY);

        //Left Controls button horizontal margins
        //let leftButtonsLeftMargin = Math.round((leftControlsWidth * 0.02) / 1.5);
        let leftButtonsLeftMargin = 0;

        //Play Button
        let playButtonWidth = Math.round(leftControlsWidth * 0.50);
        let playButtonHeight = Math.round(leftControlsWidth * 0.50);
        let playButtonMargin = Math.round((leftControlsWidth * 0.1) / 2);
        this.playButton.style['width'] = playButtonWidth + 'px';
        this.playButton.style['height'] = playButtonHeight + 'px';
        this.playButton.style['margin-left'] = leftButtonsLeftMargin + 'px';
        this.playButton.style['background-size'] = playButtonWidth + 'px' + ' ' + playButtonHeight + 'px';

        //Mute Button
        let muteButtonWidth = Math.round(leftControlsWidth * 0.50);
        let muteButtonHeight = Math.round(leftControlsWidth * 0.50);
        let muteButtonMargin = Math.round((leftControlsWidth * 0.1) / 2);
        this.muteButton.style['width'] = muteButtonWidth + 'px';
        this.muteButton.style['height'] = muteButtonHeight + 'px';
        this.muteButton.style['margin-left'] = leftButtonsLeftMargin + 'px';

        //Right Controls Button horizontal margins
        let rightButtonsLeftMargin = Math.round((rightControlsWidth * 0.02) / 1.5);

        //Fullscreen Button Sizing
        let fullscreenButtonHeight = Math.round(this.soundCanvas.height * 0.10);
        let fullscreenButtonWidth = Math.floor(rightControlsWidth * 1.0);
        this.fullscreenButton.style['width'] = fullscreenButtonWidth + 'px';
        this.fullscreenButton.style['height'] = fullscreenButtonHeight+ 'px';

        //Preset Button Sizing
        let presetButtonWidth = Math.round(rightControlsWidth * 0.48);
        let presetButtonHeight = Math.round(((this.soundCanvas.height * 0.90) / this.presetButtons.length) - (1 / this.presetButtons.length));
        for(let presetButton of this.presetButtons) {
            presetButton.style['width'] = presetButtonWidth + 'px';
            presetButton.style['height'] = presetButtonHeight + 'px';
        }

        //Mode Button Sizing
        let modeButtonWidth = Math.round(rightControlsWidth * 0.50);
        let modeButtonHeight = Math.round(((this.soundCanvas.height * 0.90) / this.modeButtons.length) - (1 / this.modeButtons.length));
        for(let modeButton of this.modeButtons) {
            modeButton.style['width'] = modeButtonWidth + 'px';
            modeButton.style['height'] = modeButtonHeight + 'px';
        }

        //Adjust touch pad height
        let soundCanvasRect = this.soundCanvas.getBoundingClientRect();
        let volPanTouchPadCanvasRect = this.volPanTouchPadCanvas.getBoundingClientRect();
        let yDiff = volPanTouchPadCanvasRect.top - soundCanvasRect.top;
        this.volPanTouchPadCanvas.height = Math.round(this.soundCanvas.height - yDiff - 3);
        this.volPanTouchPadCanvas.width = leftControlsWidth - 5;

        //Final Vertical Centering:
        this.mainContainerDiv.style['padding-top'] = Math.round((viewportHeight - canvasHeight) /2) + 'px';


    }
}