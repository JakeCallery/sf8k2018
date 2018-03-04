import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from "./jac/events/GlobalEventBus";
import JacEvent from "./jac/events/JacEvent";
let instance = null;

export default class VolPanDataObject extends EventDispatcher {
    constructor() {
        super();
        if(!instance) {
            instance = this;
        }

        this._geb = new GlobalEventBus();
        this._currentVolume = 50;
        this._currentPan = 0;

        return instance;
    }

    get currentVolume() {
        return this._currentVolume;
    }

    set currentVolume($val) {
        this._currentVolume = $val;
        this._geb.dispatchEvent(new JacEvent('volChange', this._currentVolume));
    }

    get currentPan() {
        return this._currentPan;
    }

    set currentPan($val) {
        this._currentPan = $val;
        this._geb.dispatchEvent(new JacEvent('panChange', this._currentPan));
    }

}
