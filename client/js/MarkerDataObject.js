import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import Rectangle from 'jac/geometry/Rectangle';
let instance = null;

export default class MarkerDataObject extends EventDispatcher {
    constructor(){
        super();
        if(!instance){
            instance = this;
        }

        this.loopRect = new Rectangle(0,0,0,0);

        this.startMarkerSample = null;
        this.endMarkerSample = null;
        this.samplesPerPixel = null;

        return instance;
    }

    get startMarkerX() {
        if(this.samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return null;
        }

        return Math.round(this.startMarkerSample / this.samplesPerPixel);
    }

    get endMarkerX(){
        if(this.samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return null;
        }

        return Math.round(this.endMarkerSample / this.samplesPerPixel);
    }

    set startMarkerX($xVal){
        l.debug('xVal: ', $xVal);
        if(this.samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return;
        }
        this.startMarkerSample = Math.round($xVal * this.samplesPerPixel);

        this.updateLoopRect();

        l.debug('Setting Start Sample to: ', this.startMarkerSample);
    }

    set endMarkerX($xVal){
        if(this.samplesPerPixel === null){
            l.error('Trying to set endMarkerX before samplesPerPixelSet');
            return;
        }

        this.endMarkerSample = Math.round($xVal * this.samplesPerPixel);

        this.updateLoopRect();

        l.debug('Setting End Marker Sample To: ', this.endMarkerSample);
    }

    updateLoopRect() {
        this.loopRect.width = Math.abs(this.startMarkerX - this.endMarkerX);
        if(this.endMarkerX < this.startMarkerX){
            this.loopRect.x = this.endMarkerX;
        } else {
            this.loopRect.x = this.startMarkerX;
        }
    }
}