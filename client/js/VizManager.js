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
        this.stats.showPanel(0);
        this.doc.body.appendChild(this.stats.dom);
        this.stats.dom.style.top = null;
        this.stats.dom.style.bottom = '0';

        //Elements
        this.waveCanvas = this.doc.getElementById('waveCanvas');
        this.waveCanvasContext = this.waveCanvas.getContext('2d');

        this.soundCanvas = this.doc.getElementById('soundCanvas');
        this.soundCanvasContext = this.soundCanvas.getContext('2d');

        //Delegates
        this.soundLoadedDelgate = EventUtils.bind(self, self.handleSoundLoaded);
        this.requestAnimationFrameDelegate = EventUtils.bind(self, self.handleRequestAnimationFrame);
        this.resizeStartedDelegate = EventUtils.bind(self, self.handleResizeStarted);
        this.resizeEndedDelegate = EventUtils.bind(self, self.handleResizeEnded);

        //Events
        this.geb.addEventListener('resizeStarted', this.resizeStartedDelegate);
        this.geb.addEventListener('resizeEnded', this.resizeEndedDelegate);
        this.geb.addEventListener('soundLoaded', this.soundLoadedDelgate);
    }

    handleSoundLoaded($evt) {
        l.debug('Viz Caught Sound Loaded: ', $evt);

        //Save references
        this.audioManager = $evt.data.audioManager;
        this.audioSource = $evt.data.audioSource;
        this.audioContext = $evt.data.audioContext;

        this.layoutVis();

        //Start Animation
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);

    }

    handleResizeStarted($evt) {
        l.debug('VizManager caught resize started');
        cancelAnimationFrame(this.rafId);
        this.waveCanvasContext.fillStyle = '#0000FF';
        this.waveCanvasContext.fillRect(0,0,this.waveCanvas.width, this.waveCanvas.height);
    }

    handleResizeEnded($evt) {
        l.debug('VizManager caught resize ended');
        this.layoutVis();
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    layoutVis() {
        //Determine how many samples to average to generate the line
        let totalSamples = this.audioSource.buffer.length;
        this.samplesPerLine = Math.floor(totalSamples / this.waveCanvas.width);
        this.markerDO.samplesPerPixel = this.samplesPerLine;

        let horizon = Math.round(this.waveCanvas.height/2);
        let lBuffer = this.audioSource.buffer.getChannelData(0);
        let rBuffer = this.audioSource.buffer.getChannelData(1);

        //set initial start/end markers
        this.markerDO.startMarkerSample = 0;
        this.markerDO.endMarkerSample = totalSamples-1;
        this.markerDO.loopRect.height = horizon - Math.round(horizon / 2);
        this.markerDO.loopRect.y = horizon + Math.round(horizon / 2);

        l.debug('lBuffer Length: ', lBuffer.length);
        l.debug('rBuffer Length: ', rBuffer.length);
        l.debug('Num Samples Per Line: ', this.samplesPerLine);
        l.debug('StartMarker Sample: ', this.markerDO.startMarkerSample);
        l.debug('EndMarker Sample: ', this.markerDO.endMarkerSample);

        //Clear canvas
        this.waveCanvasContext.fillStyle = '#130909';
        this.waveCanvasContext.fillRect(0,0,this.waveCanvas.width,this.waveCanvas.height);

        //Set color for line drawing
        this.waveCanvasContext.fillStyle = '#6e0a0c';

        //Setup Heights
        let heightScaleFactor = null;
        let sampleAvgMax = null;
        let sampleAvgMin = null;
        let sampleAvgRange = null;
        let sampleHeights = [];

        //Outer loop, once per line
        //Left Channel
        for(let i = 0; i < this.waveCanvas.width; i++){
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
        heightScaleFactor = (this.waveCanvas.height / 2) / sampleAvgRange;
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
            this.waveCanvasContext.fillRect(x, y, 1, height);
        }

        this.geb.dispatchEvent(new JacEvent('vizLayoutChanged'));
    }

    handleRequestAnimationFrame($evt) {
        this.stats.begin();

        //Clear Canvas
        this.clearSoundCanvas();

        //Draw Loop rect
        //this.soundCanvasContext.fillStyle = '#d6d124';
        this.soundCanvasContext.fillStyle = 'rgba(214,209,36,0.3)';
        this.soundCanvasContext.fillRect(
            this.markerDO.loopRect.x,
            this.markerDO.loopRect.y,
            this.markerDO.loopRect.width,
            this.markerDO.loopRect.height
        );

        //Draw Start Marker
        this.soundCanvasContext.fillStyle = '#00ff00';
        let startMarkerX = Math.floor(this.markerDO.startMarkerSample / this.samplesPerLine);
        this.soundCanvasContext.fillRect(startMarkerX-2, 0, 4, this.soundCanvas.height);

        //Draw End Marker
        this.soundCanvasContext.fillStyle = '#ff0000';
        let endMarkerX = Math.floor(this.markerDO.endMarkerSample / this.samplesPerLine);
        this.soundCanvasContext.fillRect(endMarkerX-2, 0, 4, this.soundCanvas.height);

        //Draw current sample line:
        this.soundCanvasContext.fillStyle = '#ffffff';
        let sampleMarkerX = Math.floor(this.audioManager.currentSampleIndex / this.samplesPerLine);
        this.soundCanvasContext.fillRect(sampleMarkerX, 0, 1, this.soundCanvas.height);

        //Request next frame
        this.stats.end();
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    clearSoundCanvas() {
        this.soundCanvasContext.clearRect(0, 0, this.soundCanvas.width, this.soundCanvas.height);
    }

}