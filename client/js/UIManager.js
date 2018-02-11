import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from "./jac/events/JacEvent";

export default class UIManager extends EventDispatcher {
    constructor($doc) {
        super();

        l.debug('New UI Manager');

        this.doc = $doc;
        this.geb = new GlobalEventBus();

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

    }

    init() {
        l.debug('DOM Ready');
        let self = this;

        //DOM elements
        this.playButton = this.doc.getElementById('playButton');
        this.pauseButton = this.doc.getElementById('pauseButton');

        //Delegates
        this.playClickDelegate = EventUtils.bind(self, self.handlePlayClick);
        this.pauseClickDelegate = EventUtils.bind(self, self.handlePauseClick);

        //Events
        this.playButton.addEventListener('click', this.playClickDelegate);
        this.pauseButton.addEventListener('click', this.pauseClickDelegate);

    }

    handlePlayClick($evt) {
        l.debug('Caught Play Click');
        this.geb.dispatchEvent(new JacEvent('requestPlay'));
    }

    handlePauseClick($evt) {
        l.debug('Caught Pause Click');
        this.geb.dispatchEvent(new JacEvent('requestPause'));
    }
}