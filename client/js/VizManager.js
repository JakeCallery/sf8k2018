import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';

export default class VizManager extends EventDispatcher {
    constructor($document){
        super();
        l.debug('New Viz Manager');

        this.doc = $document;
        this.geb = new GlobalEventBus();
        this.rafId = null;
        this.audioSource = null;
        this.audioContext = null;
        this.baseImageData = null;

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        let self = this;

        //Elements
        this.soundCanvas = this.doc.getElementById('soundCanvas');
        this.soundCanvasContext = this.soundCanvas.getContext('2d');
        this.baseImageData = this.soundCanvasContext.createImageData(this.soundCanvas.width, this.soundCanvas.height);

        //Delegates
        this.soundLoadedDelgate = EventUtils.bind(self, self.handleSoundLoaded);
        this.requestAnimationFrameDelegate = EventUtils.bind(self, self.handleRequestAnimationFrame);

        //Events
        this.geb.addEventListener('soundLoaded', this.soundLoadedDelgate);
    }

    handleSoundLoaded($evt) {
        l.debug('Viz Caught Sound Loaded');

        //Save references
        this.audioSource = $evt.data.audioSource;
        this.audioContext = $evt.data.audioContext;

        //Determine how many samples to average to generate the line
        let totalSamples = this.audioSource.buffer.length;
        let samplesPerLine = Math.ceil(totalSamples / this.soundCanvas.width);
        let horizon = Math.round(this.soundCanvas.height/2);
        let lBuffer = this.audioSource.buffer.getChannelData(0);
        let rBuffer = this.audioSource.buffer.getChannelData(1);

        l.debug('lBuffer Length: ', lBuffer.length);
        l.debug('rBuffer Length: ', rBuffer.length);
        l.debug('Num Samples Per Line: ', samplesPerLine);

        //Draw Sound & Make base copy
        this.clearCanvas();
        this.soundCanvasContext.fillStyle = '#ad131a';

        //Setup Heights
        let heightScaleFactor = null;
        let sampleAvgMax = null;
        let sampleAvgMin = null;
        let sampleAvgRange = null;
        let sampleHeights = [];
        //Outer loop, once per line
        //Left Channel
        for(let i = 0; i < this.soundCanvas.width; i++){
            let avg = null;
            let total = 0;

            //Inner loop, averages all samples to generate line height
            for(let j = 0; j < samplesPerLine; j++){
                total += lBuffer[(i*samplesPerLine)+j];
            }

            //Draw Line
            avg = total / samplesPerLine;
            sampleHeights.push(avg);

            if(avg > sampleAvgMax){
                sampleAvgMax = avg;
            } else if(avg < sampleAvgMin){
                sampleAvgMin = avg;
            }

        }

        sampleAvgRange = Math.abs(sampleAvgMax - sampleAvgMin);
        heightScaleFactor = (this.soundCanvas.height / 2) / sampleAvgRange;
        l.debug('Sample Avg Range: ', sampleAvgRange);
        l.debug('Height Scale Factor: ', heightScaleFactor);

        for(let x = 0; x < sampleHeights.length; x++){
            let y = null;
            if(sampleHeights[x] >= 0){
                y = horizon - sampleHeights[x];
            } else {
                y = horizon;
            }

            let height = sampleHeights[x] * heightScaleFactor * 2;
            this.soundCanvasContext.fillRect(x, y, 1, height);
        }


        //Right Channel

        //Save Canvas
        this.baseImageData = this.soundCanvasContext.getImageData(0,0,this.soundCanvas.width,this.soundCanvas.height);

        //TEMP
        this.soundCanvasContext.fillRect(50,50,100,100);
        //////////////

        //Start Animation
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);

    }

    handleRequestAnimationFrame($evt) {
        this.clearCanvas();
    }

    clearCanvas() {
        //Clear Canvas
        // this.soundCanvasContext.fillStyle = '#340d14';
        // this.soundCanvasContext.fillRect(0,0,this.soundCanvas.width,this.soundCanvas.height);

        this.soundCanvasContext.putImageData(this.baseImageData,0,0);
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }
}