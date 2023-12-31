import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import screenfull from 'screenfull/screenfull';
import verge from 'verge/verge';
import DOMUtils from "./jac/utils/DOMUtils";
import LimitUtils from "./jac/utils/LimitUtils";
import VolPanDataObject from "./VolPanDataObject";

export default class UIManager extends EventDispatcher {
    constructor($window) {
        super();

        l.debug('New UI Manager');

        this.window = $window;
        this.doc = $window.document;
        this.geb = new GlobalEventBus();

        this.muteButtonTouchId = null;
        this.lastOrientation = null;

        this.volPanDO = new VolPanDataObject();

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

    }

    init() {
        l.debug('DOM Ready');

        let self = this;
        this.lastOrientation = this.window.orientation;
        l.debug('Orientation: ' + this.lastOrientation);

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
        this.fullScreenClickDelegate = EventUtils.bind(self, self.handleFullScreenClick);
        this.muteButtonPressDelegate = EventUtils.bind(self, self.handleMuteButtonPress);
        this.globalMuteReleaseDelegate = EventUtils.bind(self, self.handleGlobalMuteRelease);
        this.playStateChangedDelegate = EventUtils.bind(self, self.handlePlayStateChanged);
        this.resizeDebounceDelegate = EventUtils.bind(self, LimitUtils.debounce(500, self.resizeEnd, self.resizeStart));
        this.resizeDelegate = EventUtils.bind(self, self.handleResize);
        this.orientationChangeDelegate = EventUtils.bind(self, self.handleOrientationChange);
        this.fullscreenChangeDelegate = EventUtils.bind(self, self.handleFullScreenChange);
        this.zoomDelegate = EventUtils.bind(self, self.handleZoom);

        //Events
        this.window.addEventListener('resize', this.resizeDebounceDelegate);
        this.window.addEventListener('resize', this.resizeDelegate);
        this.window.addEventListener('orientationchange', this.orientationChangeDelegate);

        //ios workaround for disabling pinch to zoom
        this.window.document.addEventListener('gesturestart', this.zoomDelegate);
        this.window.document.addEventListener('touchmove', this.zoomDelegate);

        this.playButton.addEventListener('click', this.playClickDelegate);
        this.fullScreenButton.addEventListener('click', this.fullScreenClickDelegate);
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

    handleZoom($evt) {
        let event = $evt.originalEvent || $evt;
        if(event.scale !== 1) {
            l.debug('Blocking Scale');
            event.preventDefault();
        }

        this.doc.body.style.transform = 'scale(1)';
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
        l.debug('LAST Orientation: ' + this.lastOrientation);
        l.debug('THIS orientation: ' + this.window.orientation);

        let orientationDiff = Math.abs(this.lastOrientation - this.window.orientation);
        l.debug('Orientation Diff: ' + orientationDiff);

        this.lastOrientation = this.window.orientation;

        l.debug('Caught Orientation Change: ', $evt);
        this.geb.dispatchEvent(new JacEvent('resizeStarted'));

        if(orientationDiff >= 180) {
            //Must fire resize ended right away, as there is no second resize event
            //if orientation changes by 180 degs
            this.geb.dispatchEvent(new JacEvent('resizeEnded'));
        }

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
        let sliderVol = this.volPanDO.currentVolume;

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
            DOMUtils.addClass(this.fullScreenButton, 'fullScreenButtonShrink');
        } else {
            DOMUtils.addClass(this.fullScreenButton, 'fullScreenButtonExpand')
        }
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