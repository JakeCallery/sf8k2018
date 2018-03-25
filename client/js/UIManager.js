import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import screenfull from 'screenfull/screenfull';
import verge from 'verge/verge';
import DOMUtils from "./jac/utils/DOMUtils";
import LimitUtils from "./jac/utils/LimitUtils";

export default class UIManager extends EventDispatcher {
    constructor($window) {
        super();

        l.debug('New UI Manager');

        this.window = $window;
        this.doc = $window.document;
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

        l.debug('Absolute Screen Width: ' + window.screen.width);
        l.debug('Absolute Screen Height: ' + window.screen.height);

        l.debug('Available Screen Width: ' + window.screen.availWidth);
        l.debug('Available Screen Width: ' + window.screen.availHeight);

        l.debug('Viewport Width: ', verge.viewportW());

        //DOM elements
        this.mainDiv = this.doc.getElementById('mainDiv');
        this.playButton = this.doc.getElementById('playButton');
        this.fullScreenButton = this.doc.getElementById('fullScreenButton');
        this.muteButton = this.doc.getElementById('muteButton');
        this.volPanTouchPadCanvas = this.doc.getElementById('volPanTouchPadCanvas');
        this.volPanTouchPadCanvasContext = this.volPanTouchPadCanvas.getContext('2d');

        //Delegates
        this.playClickDelegate = EventUtils.bind(self, self.handlePlayClick);
        this.requestInitialVolDelegate = EventUtils.bind(self, self.handleRequestInitialVol);
        this.fullScreenClickDelegate = EventUtils.bind(self, self.handleFullScreenClick);
        this.muteButtonPressDelegate = EventUtils.bind(self, self.handleMuteButtonPress);
        this.globalMuteReleaseDelegate = EventUtils.bind(self, self.handleGlobalMuteRelease);
        this.playStateChangedDelegate = EventUtils.bind(self, self.handlePlayStateChanged);
        this.resizeDebounceDelegate = EventUtils.bind(self, LimitUtils.debounce(500, self.resizeEnd, self.resizeStart));
        this.resizeDelegate = EventUtils.bind(self, self.handleResize);
        this.orientationChangeDelegate = EventUtils.bind(self, self.handleOrientationChange);
        this.fullscreenChangeDelegate = EventUtils.bind(self, self.handleFullScreenChange);

        //Events
        this.window.addEventListener('resize', this.resizeDebounceDelegate);
        this.window.addEventListener('resize', this.resizeDelegate);
        this.window.addEventListener('orientationchange', this.orientationChangeDelegate);

        this.playButton.addEventListener('click', this.playClickDelegate);
        this.fullScreenButton.addEventListener('click', this.fullScreenClickDelegate);
        this.geb.addEventListener('requestInitialVol', this.requestInitialVolDelegate);
        this.muteButton.addEventListener('mousedown', this.muteButtonPressDelegate);
        this.muteButton.addEventListener('touchstart', this.muteButtonPressDelegate);
        this.geb.addEventListener('playStateChanged', this.playStateChangedDelegate);

        //Manage full screen
        if(screenfull) {
            screenfull.on('change', this.fullscreenChangeDelegate);
        }

        //Notify of initial vol just in case DOM was ready late:
        this.geb.dispatchEvent(new JacEvent('setInitialVol', 50));
        this.geb.dispatchEvent(new JacEvent('setInitialPan', 0));

    }

    handleResize($evt) {
        this.geb.dispatchEvent(new JacEvent('resizing'));
    }

    resizeStart($evt) {
        l.debug('Resize Start: ', $evt);
        this.geb.dispatchEvent(new JacEvent('resizeStarted'));
    }

    resizeEnd($evt) {
        l.debug('Resize End', $evt);
        this.geb.dispatchEvent(new JacEvent('resizeEnded'));
    }

    handleOrientationChange($evt) {
        l.debug('Caught Orientation Change');
        this.geb.dispatchEvent(new JacEvent('resizeStarted'));
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

        DOMUtils.toggleClass(this.muteButton, 'muteButtonUnmute');
        this.geb.dispatchEvent(new JacEvent('volChange', 0));

    }

    handleGlobalMuteRelease($evt) {
        l.debug('Caught Mute Button Release');

        //Unmute to vol input vol
        //TODO: hook this up to new UI
        let sliderVol = 50;

        if('changedTouches' in $evt) {
            l.debug('Touch Release');
            $evt.preventDefault();
            for(let i = 0; i < $evt.changedTouches.length; i++){
                if($evt.changedTouches[i].identifier.toString() === this.muteButtonTouchId) {
                    l.debug('Mute button no longer pressed');
                    this.muteButtonTouchId = null;
                    this.doc.removeEventListener('touchend', this.globalMuteReleaseDelegate);
                    DOMUtils.toggleClass(this.muteButton, 'muteButtonUnmute');
                    this.geb.dispatchEvent(new JacEvent('volChange', sliderVol));
                }
            }
        } else {
            //mouse release
            l.debug('Mouse Global release');
            l.debug('Mute button no longer pressed');
            this.doc.removeEventListener('mouseup', this.globalMuteReleaseDelegate);
            DOMUtils.toggleClass(this.muteButton, 'muteButtonUnmute');
            this.geb.dispatchEvent(new JacEvent('volChange', sliderVol));
        }
    }

    handleFullScreenClick($evt) {
        l.debug('caught full screen click');
        screenfull.toggle();
    }

    handleFullScreenChange($evt) {
        l.debug('Caught Full Screen Change: ', screenfull.isFullscreen);
        DOMUtils.removeClass(this.fullScreenButton, 'fullScreenButtonShrink');
        DOMUtils.removeClass(this.fullScreenButton, 'fullScreenButtonExpand');
        if(screenfull.isFullscreen) {
            //this.fullScreenButton.innerHTML = 'Shrink';
            DOMUtils.addClass(this.fullScreenButton, 'fullScreenButtonShrink');
        } else {
            //this.fullScreenButton.innerHTML = 'Full';
            DOMUtils.addClass(this.fullScreenButton, 'fullScreenButtonExpand')
        }

    }


    handleRequestInitialVol($evt){
        l.debug('Setting Initial Vol');
        //TODO: update this to new UI
        //this.geb.dispatchEvent(new JacEvent('setInitialVol', this.volSlider.value));
    }

    handlePlayClick($evt) {
        l.debug('Caught Play Click');
        this.geb.dispatchEvent(new JacEvent('requestPlayToggle'));
    }

    handlePlayStateChanged($evt) {
        l.debug('Caught Play State Changed: ', $evt.data);

        let isPlaying = $evt.data;
        if(isPlaying) {
            DOMUtils.addClass(this.playButton, 'playButtonPause');
        } else {
            DOMUtils.removeClass(this.playButton, 'playButtonPause');
        }
    }

}