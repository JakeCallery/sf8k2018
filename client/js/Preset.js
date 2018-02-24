import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';

const MODES = {
    LOOP: 'loop',
    CONTINUE: 'continue'
};

export default class Preset extends EventDispatcher {
    constructor($view){
        super();

        this.startSample = null;
        this.endSample = null;
        this.mode = Preset.MODES.LOOP;

    }

    static get MODES() {
        return MODES;
    }
}



