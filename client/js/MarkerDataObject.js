import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
let instance = null;

export default class MarkerDataObject extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            instance = this;
        }

        this.startMarkerSample = null;
        this.endMarkerSample = null;
        this.samplesPerPixel = null;

        return instance;
    }

    set startMarkerX($xVal){
        l.debug('xVal: ', $xVal);
        if(this.samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return;
        }

        this.startMarkerSample = Math.round($xVal * this.samplesPerPixel);
        l.debug('Setting Start Sample to: ', this.startMarkerSample);
    }

    set endMarkerX($xVal){
        if(this.samplesPerPixel === null){
            l.error('Trying to set endMarkerX before samplesPerPixelSet');
            return;
        }

        this.endMarkerSample = Math.round($xVal * this.samplesPerPixel);
        l.debug('Setting End Marker Sample To: ', this.endMarkerSample);
    }
}