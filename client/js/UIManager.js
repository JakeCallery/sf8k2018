import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import PresetDataObject from 'PresetDataObject';
import MarkerDataObject from 'MarkerDataObject';

export default class UIManager extends EventDispatcher {
    constructor($doc) {
        super();

        l.debug('New UI Manager');

        this.doc = $doc;
        this.geb = new GlobalEventBus();
        this.presetDO = new PresetDataObject();
        this.markderDO = new MarkerDataObject();

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });

    }

    init() {
        l.debug('DOM Ready');
        let self = this;

        this.currentPSDownButton = null;
        this.currentPSDownTime = null;
        this.currentPSDownDelay = null;

        //DOM elements
        this.playButton = this.doc.getElementById('playButton');
        this.pauseButton = this.doc.getElementById('pauseButton');
        this.ps1Button = this.doc.getElementById('preset1Button');
        this.ps2Button = this.doc.getElementById('preset2Button');
        this.ps3Button = this.doc.getElementById('preset3Button');
        this.ps4Button = this.doc.getElementById('preset4Button');
        this.volSlider = this.doc.getElementById('volSlider');

        //Delegates
        this.playClickDelegate = EventUtils.bind(self, self.handlePlayClick);
        this.pauseClickDelegate = EventUtils.bind(self, self.handlePauseClick);
        this.presetMouseDownDelegate = EventUtils.bind(self, self.handlePresetMouseDown);
        this.presetClickDelegate = EventUtils.bind(self, self.handlePresetClick);
        this.globalMosueUpDelegate = EventUtils.bind(self, self.handleGlobalMouseUp);
        this.volSliderInputDelegate = EventUtils.bind(self, self.handleVolSliderInput);
        this.requestInitialVolDelegate = EventUtils.bind(self, self.handleRequestInitialVol);

        //Events
        this.playButton.addEventListener('click', this.playClickDelegate);
        this.pauseButton.addEventListener('click', this.pauseClickDelegate);

        this.ps1Button.addEventListener('click', this.presetClickDelegate);
        this.ps2Button.addEventListener('click', this.presetClickDelegate);
        this.ps3Button.addEventListener('click', this.presetClickDelegate);
        this.ps4Button.addEventListener('click', this.presetClickDelegate);

        this.ps1Button.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.ps2Button.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.ps3Button.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.ps4Button.addEventListener('mousedown', this.presetMouseDownDelegate);

        this.volSlider.addEventListener('input', this.volSliderInputDelegate);

        this.geb.addEventListener('requestInitialVol', this.requestInitialVolDelegate);

        //Notifiy of initial vol just incase DOM was ready late:
        this.geb.dispatchEvent(new JacEvent('setInitialVol', this.volSlider.value));

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
        let psButtonId = $evt.target.id;

        if(this.currentPSDownDelay > 500){
            l.debug('Set preset');
            l.debug('Target: ', psButtonId);
            this.presetDO.presetDict[psButtonId] = {
                start:this.markderDO.startMarkerSample,
                end:this.markderDO.endMarkerSample
            }
        } else {
            l.debug('Use Preset');
            l.debug('ID: ', psButtonId, psButtonId in this.presetDO.presetDict);
            if(psButtonId in this.presetDO.presetDict){
                l.debug('Has Prop');
                this.markderDO.updateStartSample(this.presetDO.presetDict[psButtonId].start);
                this.markderDO.updateEndSample(this.presetDO.presetDict[psButtonId].end);

            }

        }
    }



}