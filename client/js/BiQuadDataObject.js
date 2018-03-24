import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
let instance = null;

export default class BiQuadDataObject extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            instance = this;
        }

        this.filter = null;
        this.audioContext = null;

        return instance;
    }
}