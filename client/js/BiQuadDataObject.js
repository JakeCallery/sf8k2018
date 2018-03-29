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
        this.minValue = null;
        this.maxValue = null;
        this.numOctaves = null;
        this.qMult = null;

        return instance;
    }

    setup($minVal, $maxVal, $qMult) {
        this.minValue = $minVal;
        this.maxValue = $maxVal;
        this.qMult = $qMult;

        // Logarithm (base 2) to compute how many octaves fall in the range.
        this.numOctaves = Math.log(this.maxValue / this.minValue) / Math.LN2;

    }

    setFreqByVal($val) {
        //zero to one value
        let mult = Math.pow(2, this.numOctaves * ($val - 1.0));
        this.filter.frequency.setTargetAtTime(this.maxValue * mult, this.audioContext.currentTime, 0.01);
    }

    setQByVal($val) {
        //zero to one value
        this.filter.Q.setTargetAtTime($val * this.qMult, this.audioContext.currentTime, 0.01);
    }
}