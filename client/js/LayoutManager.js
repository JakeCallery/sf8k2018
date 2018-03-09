import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';
import verge from "./verge/verge";

export default class LayoutManager extends EventDispatcher {
    constructor($document, $window) {
        super();
        let self = this;
        this.doc = $document;
        this.window = $window;
        this.geb = new GlobalEventBus();

        this.canvasSizeMaxRatio = 0.6;

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

    }

    init() {
        let self = this;

        //Adjust canvas size based on screensize
        this.canvasContainerDiv = this.doc.getElementById('canvasContainerDiv');
        this.waveCanvas = this.doc.getElementById('waveCanvas');
        this.soundCanvas = this.doc.getElementById('soundCanvas');

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

        this.recordButton = this.doc.getElementById('recordButton');
        this.fullscreenButton = this.doc.getElementById('fullScreenButton');

        //Delegates
        this.resizeStartDelegate = EventUtils.bind(self, self.handleResizeStart);
        this.resizeEndDelegate = EventUtils.bind(self, self.handleResizeEnd);

        //Events
        this.geb.addEventListener('resizeStarted', this.resizeStartDelegate);
        this.geb.addEventListener('resizeEnded', this.resizeEndDelegate);

        this.adjustLayout();

    }

    handleResizeStart($evt) {
        l.debug('Layout Manager Caught Resize Start');
    }

    handleResizeEnd($evt) {
        l.debug('Layout Manager Caught Resize End');
        this.adjustLayout();
    }

    adjustLayout() {
        let viewportWidth = verge.viewportW();
        let viewportHeight = verge.viewportH();

        l.debug('ViewPort: ', viewportWidth, viewportHeight);

        let canvasWidth = Math.round(0.65 * viewportWidth);
        let canvasHeight = viewportHeight;

        //limit height by ratio
        let maxHeightByRatio = Math.round(canvasWidth * this.canvasSizeMaxRatio);
        l.debug('MaxHeightByRatio: ', maxHeightByRatio);
        if(canvasHeight > maxHeightByRatio) {
            canvasHeight = maxHeightByRatio;
        }

        l.debug('Final Canvas Size: ', canvasWidth, canvasHeight);

        let leftControlsWidth = Math.round(0.15 * viewportWidth);
        let rightControlsWidth = Math.round(0.2 * viewportWidth);

        this.leftControlsDiv.style['width'] = leftControlsWidth + 'px';
        this.rightControlsDiv.style['width'] = rightControlsWidth + 'px';

        this.canvasContainerDiv.style['width'] = canvasWidth + 'px';
        this.canvasContainerDiv.style['height'] = canvasHeight + 'px';

        this.waveCanvas.width = canvasWidth;
        this.waveCanvas.height = canvasHeight;

        this.soundCanvas.width = canvasWidth;
        this.soundCanvas.height = canvasHeight;

        this.waveCanvas.style['width'] = canvasWidth + 'px';
        this.waveCanvas.style['height'] = canvasHeight + 'px';

        this.soundCanvas.style['width'] = canvasWidth + 'px';
        this.soundCanvas.style['height'] = canvasHeight + 'px';

        //Left Controls button horizontal margins
        let leftButtonsLeftMargin = Math.round((leftControlsWidth * 0.02) / 1.5);

        //Play Button
        let playButtonWidth = Math.round(leftControlsWidth * 0.48);
        let playButtonHeight = Math.round(leftControlsWidth * 0.48);
        let playButtonMargin = Math.round((leftControlsWidth * 0.1) / 2);
        this.playButton.style['width'] = playButtonWidth + 'px';
        this.playButton.style['height'] = playButtonHeight + 'px';
        this.playButton.style['margin-left'] = leftButtonsLeftMargin + 'px';
        this.playButton.style['background-size'] = playButtonWidth + 'px' + ' ' + playButtonHeight + 'px';

        //Mute Button
        let muteButtonWidth = Math.round(leftControlsWidth * 0.48);
        let muteButtonHeight = Math.round(leftControlsWidth * 0.48);
        let muteButtonMargin = Math.round((leftControlsWidth * 0.1) / 2);
        this.muteButton.style['width'] = muteButtonWidth + 'px';
        this.muteButton.style['height'] = muteButtonHeight + 'px';
        this.muteButton.style['margin-left'] = leftButtonsLeftMargin + 'px';

        //Right Controls Button horizontal margins
        let rightButtonsLeftMargin = Math.round((rightControlsWidth * 0.02) / 1.5);

        //Record Button Sizing
        let recordButtonHeight = Math.round(this.soundCanvas.height * 0.20);
        let recordButtonWidth = Math.round(rightControlsWidth * 0.48);
        let recordButtonVerticalMargin = Math.round(((this.soundCanvas.height * 0.1) / this.presetButtons.length) / 2);
        this.recordButton.style['width'] = recordButtonWidth + 'px';
        this.recordButton.style['height'] = recordButtonHeight + 'px';
/*
        this.recordButton.style['margin-top'] = recordButtonVerticalMargin + 'px';
        this.recordButton.style['margin-bottom'] = recordButtonVerticalMargin + 'px';
        this.recordButton.style['margin-left'] = rightButtonsLeftMargin + 'px';
        this.recordButton.style['margin-right'] = '0';
*/
        //Fullscreen Button Sizing
        let fullscreenButtonHeight = Math.round(this.soundCanvas.height * 0.20);
        let fullscreenButtonWidth = Math.round(rightControlsWidth * 0.48);
        let fullscreenButtonVerticalMargin = Math.round(((this.soundCanvas.height * 0.1) / this.presetButtons.length) / 2);
        this.fullscreenButton.style['width'] = fullscreenButtonWidth + 'px';
        this.fullscreenButton.style['height'] = fullscreenButtonHeight+ 'px';
/*
        this.fullscreenButton.style['margin-top'] = fullscreenButtonVerticalMargin + 'px';
        this.fullscreenButton.style['margin-bottom'] = fullscreenButtonVerticalMargin + 'px';
        this.fullscreenButton.style['margin-left'] = rightButtonsLeftMargin + 'px';
        this.fullscreenButton.style['margin-right'] = '0';
*/
        //Preset Button Sizing
        //this.presetDiv.style['height'] = this.soundCanvas.height + 'px';
        let presetButtonWidth = Math.round(rightControlsWidth * 0.48);
        let presetButtonHeight = Math.round((this.soundCanvas.height * 0.80) / this.presetButtons.length);
        let presetButtonVerticalMargin = Math.round(((this.soundCanvas.height * 0.1) / this.presetButtons.length) / 2);
        presetButtonVerticalMargin += Math.round(presetButtonVerticalMargin / (this.presetButtons.length + 1));

        for(let presetButton of this.presetButtons) {
            presetButton.style['width'] = presetButtonWidth + 'px';
            presetButton.style['height'] = presetButtonHeight + 'px';
/*
            presetButton.style['margin-top'] = presetButtonVerticalMargin + 'px';
            presetButton.style['margin-bottom'] = presetButtonVerticalMargin + 'px';
            presetButton.style['margin-left'] = rightButtonsLeftMargin + 'px';
            presetButton.style['margin-right'] = '0';
*/
        }

        //Mode Button Sizing
        //this.modeDiv.style['height'] = this.soundCanvas.height + 'px';
        let modeButtonWidth = Math.round(rightControlsWidth * 0.48);
        let modeButtonHeight = Math.round((this.soundCanvas.height * 0.80) / this.modeButtons.length);
        let modeButtonVerticalMargin = Math.round(((this.soundCanvas.height * 0.1) / this.modeButtons.length) / 2);
        modeButtonVerticalMargin += Math.round(modeButtonVerticalMargin / (this.modeButtons.length + 1));

        for(let modeButton of this.modeButtons) {
            modeButton.style['width'] = modeButtonWidth + 'px';
            modeButton.style['height'] = modeButtonHeight + 'px';
/*
            modeButton.style['margin-top'] = modeButtonVerticalMargin + 'px';
            modeButton.style['margin-bottom'] = modeButtonVerticalMargin + 'px';
            modeButton.style['margin-left'] = rightButtonsLeftMargin + 'px';
            modeButton.style['margin-right'] = '0';
*/
        }

        //change left controls top margin to be same as right
        this.playButton.style['margin-top'] = presetButtonVerticalMargin + 'px';
        this.muteButton.style['margin-top'] = presetButtonVerticalMargin + 'px';

        //VolPanTouchPad
        this.volPanTouchPadDiv.style['margin-top'] = Math.round(muteButtonMargin /2) + 'px';

        let soundCanvasRect = this.soundCanvas.getBoundingClientRect();
        let volPanTouchPadCanvasRect = this.volPanTouchPadCanvas.getBoundingClientRect();
        let yDiff = volPanTouchPadCanvasRect.top - soundCanvasRect.top;
        this.volPanTouchPadCanvas.height = Math.round(this.soundCanvas.height - yDiff);
        this.volPanTouchPadCanvas.width = leftControlsWidth;


    }
}