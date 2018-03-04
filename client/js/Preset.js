import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import MarkerDataObject from "./MarkerDataObject";
import JacEvent from "./jac/events/JacEvent";
import GlobalEventBus from "./jac/events/GlobalEventBus";
import DOMUtils from './jac/utils/DOMUtils';

const MODES = {
    LOOP: 'loop',
    CONTINUE: 'continue'
};

export default class Preset extends EventDispatcher {
    constructor($presetButtonView, $modeButtonView){
        super();

        let self = this;

        this.geb = new GlobalEventBus();
        this.startSample = null;
        this.endSample = null;
        this.mode = Preset.MODES.LOOP;
        this.isSet = false;
        this.inUse = false;

        this.markerDO = new MarkerDataObject();

        this.currentPSDownTime = null;
        this.currentPSDownDelay = null;

        this.presetTouchId = null;

        //DOM
        this.presetButtonView = $presetButtonView;
        this.modeButtonView = $modeButtonView;
        this.doc = this.presetButtonView.ownerDocument;

        //Delegates
        this.presetMouseDownDelegate = EventUtils.bind(self, self.handlePresetMouseDown);
        this.presetClickDelegate = EventUtils.bind(self, self.handlePresetClick);
        this.globalMosueUpDelegate = EventUtils.bind(self, self.handleGlobalMouseUp);
        this.startMarkerUpdatedDelegate = EventUtils.bind(self, self.handleStartMarkerUpdated);
        this.endMarkerUpdatedDelegate = EventUtils.bind(self, self.handleEndMarkerUpdated);
        this.modeClickDelgate = EventUtils.bind(self, self.handleModeClick);
        this.presetTouchStartDelegate = EventUtils.bind(self, self.handlePresetTouchStart);
        this.touchEndDelegate = EventUtils.bind(self, self.handleTouchEnd);

        //Events
        this.presetButtonView.addEventListener('click', this.presetClickDelegate);
        this.modeButtonView.addEventListener('click', this.modeClickDelgate);
        this.presetButtonView.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.presetButtonView.addEventListener('touchstart', this.presetTouchStartDelegate);
        this.presetButtonView.addEventListener('touchend', this.touchEndDelegate);
        this.markerDO.addEventListener('startMarkerUpdated', this.startMarkerUpdatedDelegate);
        this.markerDO.addEventListener('endMarkerUpdated', this.endMarkerUpdatedDelegate);

        l.debug('New Preset: ', this.presetButtonView.id);

    }

    handlePresetTouchStart($evt) {
        $evt.preventDefault();
        if(this.presetTouchId === null) {
            let touch = $evt.changedTouches[0];
            l.debug('Preset Touch ID: ', touch.identifier);
            this.presetTouchId = touch.identifier.toString();
            this.currentPSDownTime = Date.now();
        }
    }

    handleTouchEnd($evt) {
        l.debug('----- Preset Touch End Target: ', $evt.target.id);

        for(let i = 0; i < $evt.changedTouches.length; i++) {
            let touch = $evt.changedTouches[i];
            let touchId = touch.identifier.toString();
            let el = this.doc.elementFromPoint(touch.clientX, touch.clientY);
            l.debug('EL From Point: ', el.id);

            if(el === this.presetButtonView && this.presetTouchId === touchId) {
                this.handlePresetClick();
            }

            if(this.presetTouchId === touchId) {
                this.presetTouchId = null;
                this.currentPSDownTime = null;
                this.currentPSDownDelay = null;
            }

        }
    }

    handleGlobalMouseUp($evt){
        l.debug('Caught Global Mouse Up: ', $evt.target, $evt.currentTarget);
        this.doc.removeEventListener('mouseup', this.globalMosueUpDelegate);
    }

    handlePresetMouseDown($evt){
        l.debug('PS Mouse Down');
        this.currentPSDownTime = Date.now();
        this.doc.addEventListener('mouseup', this.globalMosueUpDelegate);
    }

    handleModeClick($evt) {
        l.debug('Mode Click: ', this.modeButtonView.id);

       switch(this.mode){
           case Preset.MODES.LOOP:
               this.setMode(Preset.MODES.CONTINUE);
               break;

           case Preset.MODES.CONTINUE:
               this.setMode(Preset.MODES.LOOP);
                break;

           default:
               l.error('Unknown Mode: ', this.mode);
       }

    }

    setMode($mode) {
        let oldMode = this.mode;
        this.mode = $mode;

        switch($mode) {
            case Preset.MODES.LOOP:
                DOMUtils.toggleClass(this.modeButtonView, 'modeButtonContinue');
                break;

            case Preset.MODES.CONTINUE:
                DOMUtils.toggleClass(this.modeButtonView, 'modeButtonContinue');
                break;

            default:
                l.error('Unhandled Mode: ', $mode);
                this.mode = oldMode;
        }
    }

    handlePresetClick() {
        this.currentPSDownDelay = Date.now() - this.currentPSDownTime;
        l.debug('Delay: ', this.currentPSDownDelay);

        if(this.currentPSDownDelay > 500){
            l.debug('Set preset');
            this.setPreset(this.markerDO.startMarkerSample, this.markerDO.endMarkerSample);
        } else {
            l.debug('Use Preset');
            if(this.isSet){
                this.usePreset();
            } else {
                l.debug('Preset not set');
            }
        }

        //l.debug('Preset In Use: ' + this.presetButtonView.id + ': ' + this.inUse);
    }

    handleStartMarkerUpdated($evt) {
        this.inUse = false;
        //l.debug('Preset In Use: ' + this.presetButtonView.id + ': ' + this.inUse);
    }

    handleEndMarkerUpdated($evt) {
        this.inUse = false;
        //l.debug('Preset In Use: ' + this.presetButtonView.id + ': ' + this.inUse);
    }

    setPreset($startSample, $endSample) {
        this.startSample = $startSample;
        this.endSample = $endSample;
        this.isSet = true;
        this.inUse = true;
    }

    usePreset() {
        this.markerDO.updateStartSample(this.startSample);
        this.markerDO.updateEndSample(this.endSample);
        this.geb.dispatchEvent(new JacEvent('forceUpdateCurrentSampleIndex', this.startSample));
        this.inUse = true;
    }

    static get MODES() {
        return MODES;
    }
}



