import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import screenfull from 'screenfull/screenfull';

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
        this.mainContainerDiv = this.doc.getElementById('mainContainerDiv');
        this.playButton = this.doc.getElementById('playButton');
        this.pauseButton = this.doc.getElementById('pauseButton');
        this.fullScreenButton = this.doc.getElementById('fullScreenButton');
        this.volSlider = this.doc.getElementById('volSlider');

        //Delegates
        this.playClickDelegate = EventUtils.bind(self, self.handlePlayClick);
        this.pauseClickDelegate = EventUtils.bind(self, self.handlePauseClick);
        this.volSliderInputDelegate = EventUtils.bind(self, self.handleVolSliderInput);
        this.requestInitialVolDelegate = EventUtils.bind(self, self.handleRequestInitialVol);
        this.fullScreenClickDelegate = EventUtils.bind(self, self.handleFullScreenClick);

        //Events
        this.playButton.addEventListener('click', this.playClickDelegate);
        this.pauseButton.addEventListener('click', this.pauseClickDelegate);
        this.fullScreenButton.addEventListener('click', this.fullScreenClickDelegate);
        this.volSlider.addEventListener('input', this.volSliderInputDelegate);
        this.geb.addEventListener('requestInitialVol', this.requestInitialVolDelegate);

        //Notifiy of initial vol just incase DOM was ready late:
        this.geb.dispatchEvent(new JacEvent('setInitialVol', this.volSlider.value));

    }

    handleFullScreenClick($evt) {
        l.debug('caught full screen click');
        screenfull.request(this.mainContainerDiv);
    }

    handleRequestInitialVol($evt){
        l.debug('Setting Initial Vol');
        this.geb.dispatchEvent(new JacEvent('setInitialVol', this.volSlider.value));
    }

    handleVolSliderInput($evt) {
        l.debug('Vol Slider Change: ', $evt.target.value);
        this.geb.dispatchEvent(new JacEvent('volchange', $evt.target.value))

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