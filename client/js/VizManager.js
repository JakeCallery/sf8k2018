import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from 'jac/events/JacEvent';
import MarkerDataObject from 'MarkerDataObject';
import Stats from 'mrdoob/Stats';

export default class VizManager extends EventDispatcher {
    constructor($document){
        super();
        l.debug('New Viz Manager');

        this.doc = $document;
        this.geb = new GlobalEventBus();
        this.rafId = null;
        this.audioManager = null;
        this.audioSource = null;
        this.audioContext = null;
        this.baseImageData = null;
        this.samplesPerLine = null;
        this.markerDO = new MarkerDataObject();

        //Wait for the DOM to be ready
        this.doc.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        let self = this;

        //Stats
        this.stats = new Stats();
        this.stats.showPanel(1);
        this.doc.body.appendChild(this.stats.dom);

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
        l.debug('Viz Caught Sound Loaded: ', $evt);

        //Save references
        this.audioManager = $evt.data.audioManager;
        this.audioSource = $evt.data.audioSource;
        this.audioContext = $evt.data.audioContext;

        //Determine how many samples to average to generate the line
        let totalSamples = this.audioSource.buffer.length;
        this.samplesPerLine = Math.floor(totalSamples / this.soundCanvas.width);
        this.markerDO.samplesPerPixel = this.samplesPerLine;
        let horizon = Math.round(this.soundCanvas.height/2);
        let lBuffer = this.audioSource.buffer.getChannelData(0);
        let rBuffer = this.audioSource.buffer.getChannelData(1);

        //set initial start/end markers
        this.markerDO.startMarkerSample = 0;
        this.markerDO.endMarkerSample = totalSamples-1;

        l.debug('lBuffer Length: ', lBuffer.length);
        l.debug('rBuffer Length: ', rBuffer.length);
        l.debug('Num Samples Per Line: ', this.samplesPerLine);
        l.debug('StartMarker Sample: ', this.markerDO.startMarkerSample);
        l.debug('EndMarker Sample: ', this.markerDO.endMarkerSample);
        //Clear canvas
        this.soundCanvasContext.fillStyle = '#220c11';
        this.soundCanvasContext.fillRect(0,0,this.soundCanvas.width,this.soundCanvas.height);

        //Set color for line drawing
        this.soundCanvasContext.fillStyle = '#6e0a0c';

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
            for(let j = 0; j < this.samplesPerLine; j++){
                total += lBuffer[(i*this.samplesPerLine)+j];
            }

            //Calc Sample height Avg and Save avg Height
            avg = total / this.samplesPerLine;
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

        //Save Canvas
        this.baseImageData = this.soundCanvasContext.getImageData(0,0,this.soundCanvas.width,this.soundCanvas.height);

        //Start Animation
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);

    }

    handleRequestAnimationFrame($evt) {
        this.stats.begin();

        //Clear Canvas
        this.clearCanvas();

        //Draw current sample line:
        this.soundCanvasContext.fillStyle = '#ffffff';
        let sampleMarkerX = Math.floor(this.audioManager.currentSampleIndex / this.samplesPerLine);
        this.soundCanvasContext.fillRect(sampleMarkerX, 0, 1, this.soundCanvas.height);

        //Draw Start Marker
        this.soundCanvasContext.fillStyle = '#00ff00';
        let startMarkerX = Math.floor(this.markerDO.startMarkerSample / this.samplesPerLine);
        this.soundCanvasContext.fillRect(startMarkerX-2, 0, 4, this.soundCanvas.height);

        //Draw End Marker
        this.soundCanvasContext.fillStyle = '#ff0000';
        let endMarkerX = Math.floor(this.markerDO.endMarkerSample / this.samplesPerLine);
        this.soundCanvasContext.fillRect(endMarkerX-2, 0, 4, this.soundCanvas.height);

        //Request next frame
        this.stats.end();
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    clearCanvas() {
        //Clear Canvas
        //TODO: Faster copy of data:
        //https://stackoverflow.com/questions/48013380/faster-way-to-copy-array-values-into-canvas-pixel-data
        //https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/

        //TODO: Or just layer it, leave the underlying waveform, and just position a line over it on a separate layer or something

        this.soundCanvasContext.putImageData(this.baseImageData,0,0);

    }
}