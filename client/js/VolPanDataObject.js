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
        this._currentVolume = 50;   //0 -> 100
        this._currentPan = 0;       //-100 -> 100

        return instance;
    }

    get currentVolume() {
        return this._currentVolume;
    }

    set currentVolume($val) {
        //Set Limit
        if($val > 100) {
            $val = 100;
        }
        if($val < 0) {
            $val = 0;
        }

        this._currentVolume = $val;
        this._geb.dispatchEvent(new JacEvent('volChange', this._currentVolume));
    }

    get currentPan() {
        return this._currentPan;
    }

    set currentPan($val) {
        if($val > 100) {
            $val = 100;
        }
        if($val < -100) {
            $val = -100;
        }

        this._currentPan = $val;
        this._geb.dispatchEvent(new JacEvent('panChange', this._currentPan));
    }

}
