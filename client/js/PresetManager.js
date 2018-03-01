import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import Preset from 'Preset';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import EventUtils from "./jac/utils/EventUtils";

export default class PresetManager extends EventDispatcher {
    constructor($doc){
        super($doc);
        this.doc = $doc;

        this.geb = new GlobalEventBus();
        this.presets = [];

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

        this.mode1Button = this.doc.getElementById('mode1Button');
        this.mode2Button = this.doc.getElementById('mode2Button');
        this.mode3Button = this.doc.getElementById('mode3Button');
        this.mode4Button = this.doc.getElementById('mode4Button');

        //Delegates
        this.exceedingPresetDelegate = EventUtils.bind(self, self.handleExceedingPreset);

        //Events
        this.geb.addEventListener('exceedingPreset', this.exceedingPresetDelegate);

        //Setup presets
        this.presets.push(new Preset(this.ps1Button, this.mode1Button));
        this.presets.push(new Preset(this.ps2Button, this.mode2Button));
        this.presets.push(new Preset(this.ps3Button, this.mode3Button));
        this.presets.push(new Preset(this.ps4Button, this.mode4Button));

    }

    handleExceedingPreset($evt) {
        let currentPresetIndex = this.getActivePresetIndex();
        if(currentPresetIndex !== null) {
            //Check mode, and select next preset if needed
            let currentPreset = this.presets[currentPresetIndex];
            if(currentPreset.mode === Preset.MODES.CONTINUE) {
                l.debug('should continue here: ', currentPresetIndex);
                this.useNextPreset(currentPresetIndex);
            }
        } else {
            //l.debug('no preset active, not taking action');
        }
    }

    useNextPreset($currentIndex) {
        l.debug('useNextPreset');
        let nextIndex = this.getNextSetPresetIndex($currentIndex);
        this.presets[nextIndex].usePreset();
    }

    getNextSetPresetIndex($currentIndex) {
        let index = $currentIndex;
        let count = 0;
        let numPresets = this.presets.length;

        while(count < numPresets) {
            index += 1;

            if(index >= numPresets){
                index = 0;
                l.debug('Reset to zero');
            }

            if(this.presets[index].isSet === true){
                l.debug('Returning Index: ', index);
                return index;
            }

            count +=1;
            if(count > numPresets){
                l.debug('Exceeded count');
                return $currentIndex;
            }
        }
    }

    getActivePresetIndex(){
        //TODO: May want to cache this instead since we are against the
        //clock set but the audio buffer when we run this
        let presetIndex = null;
        let numPresets = this.presets.length;
        for(let i = 0; i < numPresets; i++){
            if(this.presets[i].inUse){
                //preset = this.presets[i];
                presetIndex = i;
                break;
            }
        }
        return presetIndex;
    }
}

