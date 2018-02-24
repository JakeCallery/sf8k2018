import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import MarkerDataObject from "./MarkerDataObject";

const MODES = {
    LOOP: 'loop',
    CONTINUE: 'continue'
};

export default class Preset extends EventDispatcher {
    constructor($presetButtonView, $modeButtonView){
        super();

        let self = this;


        this.startSample = null;
        this.endSample = null;
        this.mode = Preset.MODES.LOOP;
        this.isSet = false;
        this.inUse = false;

        this.markerDO = new MarkerDataObject();

        this.currentPSDownTime = null;
        this.currentPSDownDelay = null;

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

        //Events
        this.presetButtonView.addEventListener('click', this.presetClickDelegate);
        this.modeButtonView.addEventListener('click', this.modeClickDelgate);
        this.presetButtonView.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.markerDO.addEventListener('startMarkerUpdated', this.startMarkerUpdatedDelegate);
        this.markerDO.addEventListener('endMarkerUpdated', this.endMarkerUpdatedDelegate);

        l.debug('New Preset: ', this.presetButtonView.id);

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
                this.modeButtonView.innerHTML = 'Loop';
                break;

            case Preset.MODES.CONTINUE:
                this.modeButtonView.innerHTML = 'Continue';
                break;

            default:
                l.error('Unhandled Mode: ', $mode);
                this.mode = oldMode;
        }
    }

    handlePresetClick($evt) {
        this.currentPSDownDelay = Date.now() - this.currentPSDownTime;
        l.debug('Delay: ', this.currentPSDownDelay);

        if(this.currentPSDownDelay > 500){
            l.debug('Set preset');
            this.startSample = this.markerDO.startMarkerSample;
            this.endSample = this.markerDO.endMarkerSample;
            this.isSet = true;
            this.inUse = true;
        } else {
            l.debug('Use Preset');
            if(this.isSet){
                this.markerDO.updateStartSample(this.startSample);
                this.markerDO.updateEndSample(this.endSample);
                this.inUse = true;
            } else {
                l.debug('Preset not set');
            }
        }

        l.debug('Preset In Use: ' + this.presetButtonView.id + ': ' + this.inUse);
    }

    handleStartMarkerUpdated($evt) {
        this.inUse = false;
        l.debug('Preset In Use: ' + this.presetButtonView.id + ': ' + this.inUse);
    }

    handleEndMarkerUpdated($evt) {
        this.inUse = false;
        l.debug('Preset In Use: ' + this.presetButtonView.id + ': ' + this.inUse);
    }

    static get MODES() {
        return MODES;
    }
}



