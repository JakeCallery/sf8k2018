import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
let instance = null;

export default class PresetDataObject extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            instance = this;
        }

        this.presetDict = {};

        return instance;
    }
}