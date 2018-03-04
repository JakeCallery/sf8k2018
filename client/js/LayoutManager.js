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

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

    }

    init() {
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

        this.adjustLayout();

    }

    adjustLayout() {
        let viewportWidth = verge.viewportW();
        let canvasWidth = Math.round(0.65 * viewportWidth);
        let leftControlsWidth = Math.round(0.15 * viewportWidth);
        let rightControlsWidth = Math.round(0.2 * viewportWidth);

        this.leftControlsDiv.style['width'] = leftControlsWidth + 'px';
        this.rightControlsDiv.style['width'] = rightControlsWidth + 'px';

        this.canvasContainerDiv.style['width'] = canvasWidth + 'px';

        this.waveCanvas.width = canvasWidth;
        this.soundCanvas.width = canvasWidth;

        this.waveCanvas.style['width'] = canvasWidth + 'px';
        this.soundCanvas.style['width'] = canvasWidth + 'px';

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

        //Preset Button Sizing
        this.presetDiv.style['height'] = this.soundCanvas.height + 'px';
        let presetButtonWidth = Math.round(rightControlsWidth * 0.48);
        let presetButtonHeight = Math.round((this.soundCanvas.height * 0.90) / this.presetButtons.length);
        let presetButtonVerticalMargin = Math.round(((this.soundCanvas.height * 0.1) / this.presetButtons.length) / 2);
        presetButtonVerticalMargin += Math.round(presetButtonVerticalMargin / (this.presetButtons.length + 1));

        for(let presetButton of this.presetButtons) {
            presetButton.style['width'] = presetButtonWidth + 'px';
            presetButton.style['height'] = presetButtonHeight + 'px';
            presetButton.style['margin-top'] = presetButtonVerticalMargin + 'px';
            presetButton.style['margin-bottom'] = presetButtonVerticalMargin + 'px';
            presetButton.style['margin-left'] = rightButtonsLeftMargin + 'px';
            presetButton.style['margin-right'] = '0';
        }

        //Mode Button Sizing
        this.modeDiv.style['height'] = this.soundCanvas.height + 'px';
        let modeButtonWidth = Math.round(rightControlsWidth * 0.48);
        let modeButtonHeight = Math.round((this.soundCanvas.height * 0.90) / this.modeButtons.length);
        let modeButtonVerticalMargin = Math.round(((this.soundCanvas.height * 0.1) / this.modeButtons.length) / 2);
        modeButtonVerticalMargin += Math.round(modeButtonVerticalMargin / (this.modeButtons.length + 1));

        for(let modeButton of this.modeButtons) {
            modeButton.style['width'] = modeButtonWidth + 'px';
            modeButton.style['height'] = modeButtonHeight + 'px';
            modeButton.style['margin-top'] = modeButtonVerticalMargin + 'px';
            modeButton.style['margin-bottom'] = modeButtonVerticalMargin + 'px';
            modeButton.style['margin-left'] = rightButtonsLeftMargin + 'px';
            modeButton.style['margin-right'] = '0';
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