import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';
import verge from "./verge/verge";

export default class LayoutManager extends EventDispatcher {
    constructor($document) {
        super();
        let self = this;
        this.doc = $document;

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

        this.presetDiv = this.doc.getElementById('presetDiv');
        this.presetButtons = this.doc.getElementsByClassName('presetButton');

        this.adjustLayout();

    }

    adjustLayout() {
        let viewportWidth = verge.viewportW();
        let canvasWidth = Math.round(0.70 * viewportWidth);
        let leftControlsWidth = Math.round(0.1 * viewportWidth);
        let rightControlsWidth = Math.round(0.2 * viewportWidth);

        this.leftControlsDiv.style.width = leftControlsWidth + 'px';
        this.rightControlsDiv.style.width = rightControlsWidth + 'px';

        this.canvasContainerDiv.style.width = canvasWidth + 'px';

        this.waveCanvas.width = canvasWidth;
        this.soundCanvas.width = canvasWidth;

        this.waveCanvas.style.width = canvasWidth + 'px';
        this.soundCanvas.style.width = canvasWidth + 'px';

        this.presetDiv.style.height = this.soundCanvas.height + 'px';

        let presetButtonWidth = Math.round(rightControlsWidth * 0.50);
        let presetButtonHeight = Math.round((this.soundCanvas.height * 0.90) / this.presetButtons.length);


        let presetButtonMargin = Math.round(((this.soundCanvas.height * 0.1) / this.presetButtons.length) / 2);
        presetButtonMargin += Math.round(presetButtonMargin / (this.presetButtons.length + 1));

        for(let presetButton of this.presetButtons) {
            presetButton.style.width = presetButtonWidth + 'px';
            presetButton.style.height = presetButtonHeight + 'px';
            presetButton.style.margin = presetButtonMargin + 'px';
        }


    }
}