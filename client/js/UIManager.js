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

        this.muteButtonTouchId = null;

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
        this.muteButton = this.doc.getElementById('muteButton');

        //Delegates
        this.playClickDelegate = EventUtils.bind(self, self.handlePlayClick);
        this.pauseClickDelegate = EventUtils.bind(self, self.handlePauseClick);
        this.volSliderInputDelegate = EventUtils.bind(self, self.handleVolSliderInput);
        this.requestInitialVolDelegate = EventUtils.bind(self, self.handleRequestInitialVol);
        this.fullScreenClickDelegate = EventUtils.bind(self, self.handleFullScreenClick);
        this.muteButtonPressDelegate = EventUtils.bind(self, self.handleMuteButtonPress);
        this.globalMuteReleaseDelegate = EventUtils.bind(self, self.handleGlobalMuteRelease);

        //Events
        this.playButton.addEventListener('click', this.playClickDelegate);
        this.pauseButton.addEventListener('click', this.pauseClickDelegate);
        this.fullScreenButton.addEventListener('click', this.fullScreenClickDelegate);
        this.volSlider.addEventListener('input', this.volSliderInputDelegate);
        this.geb.addEventListener('requestInitialVol', this.requestInitialVolDelegate);
        this.muteButton.addEventListener('mousedown', this.muteButtonPressDelegate);
        this.muteButton.addEventListener('touchstart', this.muteButtonPressDelegate);

        //Notifiy of initial vol just incase DOM was ready late:
        this.geb.dispatchEvent(new JacEvent('setInitialVol', this.volSlider.value));

    }

    handleMuteButtonPress($evt) {
        l.debug('Caught Mute Button Press');

        if('changedTouches' in $evt) {
            //Touch Press
            l.debug('Touch Press');
            $evt.preventDefault();
            this.muteButtonTouchId = $evt.changedTouches[0].identifier.toString();
            this.doc.addEventListener('touchend', this.globalMuteReleaseDelegate);
        } else {
            //Mouse press
            l.debug('Mouse Press');
            this.doc.addEventListener('mouseup', this.globalMuteReleaseDelegate);
        }

        this.geb.dispatchEvent(new JacEvent('momentaryMute'));

    }

    handleGlobalMuteRelease($evt) {
        l.debug('Caught Mute Button Release');

        //Workaround for GainNode values not updating quick enough
        //for rapid mute and unmute
        let sliderVol = this.volSlider.value;

        if('changedTouches' in $evt) {
            l.debug('Touch Release');
            $evt.preventDefault();
            for(let i = 0; i < $evt.changedTouches.length; i++){
                if($evt.changedTouches[i].identifier.toString() === this.muteButtonTouchId) {
                    l.debug('Mute button no longer pressed');
                    this.muteButtonTouchId = null;
                    this.doc.removeEventListener('touchend', this.globalMuteReleaseDelegate);
                    this.geb.dispatchEvent(new JacEvent('unmute', sliderVol));
                }
            }
        } else {
            //mouse release
            l.debug('Mouse Global release');
            l.debug('Mute button no longer pressed');
            this.doc.removeEventListener('mouseup', this.globalMuteReleaseDelegate);
            this.geb.dispatchEvent(new JacEvent('unmute', sliderVol));
        }
    }

    handleFullScreenClick($evt) {
        l.debug('caught full screen click');
        //screenfull.request(this.mainContainerDiv);
        screenfull.request();
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