import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from "./jac/events/GlobalEventBus";
import JacEvent from "./jac/events/JacEvent";
let instance = null;

export default class GlobalDataObject extends EventDispatcher {
    constructor() {
        super();
        if (!instance) {
            instance = this;
        }

        this.geb = new GlobalEventBus();
        this.isDebugging = true;
        this.lowerAreaY = null;
        this._hasTouchedOnce = false;

        return instance;
    }

    set hasTouchedOnce($boolVal) {
        if($boolVal === true && this._hasTouchedOnce === false) {
            this._hasTouchedOnce = $boolVal;
            this.geb.dispatchEvent(new JacEvent('forceReLayout'));
        } else {
            this._hasTouchedOnce = $boolVal;
        }
    }

    get hasTouchedOnce() {
        return this._hasTouchedOnce;
    }
}