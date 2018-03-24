import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
let instance = null;

export default class FFTDataObject extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            instance = this;
        }

        this.fftAnalyzer = null;
        this.fftBufferLength = null;
        this.fftDataArray = null;

        return instance;
    }
}