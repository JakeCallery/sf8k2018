import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import Preset from 'Preset';

export default class PresetManager extends EventDispatcher {
    constructor($doc){
        super($doc);
        this.doc = $doc;

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

        //Events

        //Setup presets
        this.presets.push(new Preset(this.ps1Button, this.mode1Button));
        this.presets.push(new Preset(this.ps2Button, this.mode2Button));
        this.presets.push(new Preset(this.ps3Button, this.mode3Button));
        this.presets.push(new Preset(this.ps4Button, this.mode4Button));

    }


}

