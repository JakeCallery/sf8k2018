import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';
import Preset from 'Preset';
import MarkerDataObject from "./MarkerDataObject";
import PresetDataObject from "./PresetDataObject";

export default class PresetManager extends EventDispatcher {
    constructor($doc){
        super($doc);
        this.doc = $doc;

        this.presetDO = new PresetDataObject();
        this.markderDO = new MarkerDataObject();

        this.currentPSDownButton = null;
        this.currentPSDownTime = null;
        this.currentPSDownDelay = null;


        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        l.debug('Preset Manager Ready');

        let self = this;

        //DOM Elements
        this.ps1Button = this.doc.getElementById('preset1Button');
        this.ps2Button = this.doc.getElementById('preset2Button');
        this.ps3Button = this.doc.getElementById('preset3Button');
        this.ps4Button = this.doc.getElementById('preset4Button');

        //Delegates
        this.presetMouseDownDelegate = EventUtils.bind(self, self.handlePresetMouseDown);
        this.presetClickDelegate = EventUtils.bind(self, self.handlePresetClick);
        this.globalMosueUpDelegate = EventUtils.bind(self, self.handleGlobalMouseUp);

        //Events
        this.ps1Button.addEventListener('click', this.presetClickDelegate);
        this.ps2Button.addEventListener('click', this.presetClickDelegate);
        this.ps3Button.addEventListener('click', this.presetClickDelegate);
        this.ps4Button.addEventListener('click', this.presetClickDelegate);

        this.ps1Button.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.ps2Button.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.ps3Button.addEventListener('mousedown', this.presetMouseDownDelegate);
        this.ps4Button.addEventListener('mousedown', this.presetMouseDownDelegate);


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

