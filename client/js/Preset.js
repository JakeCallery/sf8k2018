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

        this.markerDO = new MarkerDataObject();

        this.currentPSDownButton = null;
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

        //Events
        this.presetButtonView.addEventListener('click', this.presetClickDelegate);
        this.presetButtonView.addEventListener('mousedown', this.presetMouseDownDelegate);

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

    handlePresetClick($evt) {
        this.currentPSDownDelay = Date.now() - this.currentPSDownTime;
        l.debug('Delay: ', this.currentPSDownDelay);

        if(this.currentPSDownDelay > 500){
            l.debug('Set preset');
            this.startSample = this.markerDO.startMarkerSample;
            this.endSample = this.markerDO.endMarkerSample;
            this.isSet = true;
        } else {
            l.debug('Use Preset');
            if(this.isSet){
                this.markerDO.updateStartSample(this.startSample);
                this.markerDO.updateEndSample(this.endSample);
            } else {
                l.debug('Preset not set');
            }

        }
    }

    static get MODES() {
        return MODES;
    }
}



