import l from 'jac/logger/Logger';
import EventDispatcher from 'jac/events/EventDispatcher';
import JacEvent from 'jac/events/JacEvent';
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
        this._samplesPerPixel = null;

        return instance;
    }

    updateStartSample($sampleIndex) {
        this.startMarkerSample = $sampleIndex;
        this.updateLoopRect();
        l.debug('---------------- Updatged Start Marker Sample: ', $sampleIndex);
        this.dispatchEvent(new JacEvent('startMarkerUpdated', this.startMarkerSample));
    }

    updateEndSample($sampleIndex) {
        this.endMarkerSample = $sampleIndex;
        this.updateLoopRect();
        this.dispatchEvent(new JacEvent('startMarkerUpdated', this.endMarkerSample));
    }

    get samplesPerPixel() {
        if(this._samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return null;
        }

        return this._samplesPerPixel;
    }

    set samplesPerPixel($val) {
        this._samplesPerPixel = $val;
        this.updateLoopRect();
    }

    get startMarkerX() {
        if(this._samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return null;
        }

        return Math.round(this.startMarkerSample / this._samplesPerPixel);
    }

    get endMarkerX(){
        if(this._samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return null;
        }

        return Math.round(this.endMarkerSample / this._samplesPerPixel);
    }

    set startMarkerX($xVal){
        l.debug('xVal: ', $xVal);
        if(this._samplesPerPixel === null){
            l.error('Trying to set startMarkerX before samplesPerPixelSet');
            return;
        }
        this.startMarkerSample = Math.round($xVal * this._samplesPerPixel);

        this.updateLoopRect();

        this.dispatchEvent(new JacEvent('startMarkerUpdated', this.startMarkerSample));

        l.debug('Setting Start Sample to: ', this.startMarkerSample);
    }

    set endMarkerX($xVal){
        if(this._samplesPerPixel === null){
            l.error('Trying to set endMarkerX before samplesPerPixelSet');
            return;
        }

        this.endMarkerSample = Math.round($xVal * this._samplesPerPixel);

        this.updateLoopRect();

        this.dispatchEvent(new JacEvent('endMarkerUpdated', this.endMarkerSample));

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