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
        this.samplesPerLine = null;
        this.totalSamples = null;
        this.horizon = null;
        this.lBuffer = null;
        this.rBuffer = null;
        this.markerDO = new MarkerDataObject();
        this.isResizing = false;

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

        this.cleanWaveCanvas = this.doc.getElementById('cleanWaveCanvas');
        this.cleanWaveCanvasContext = this.cleanWaveCanvas.getContext('2d');

        this.soundCanvas = this.doc.getElementById('soundCanvas');
        this.soundCanvasContext = this.soundCanvas.getContext('2d');

        //Delegates
        this.soundLoadedDelgate = EventUtils.bind(self, self.handleSoundLoaded);
        this.requestAnimationFrameDelegate = EventUtils.bind(self, self.handleRequestAnimationFrame);
        this.resizeStartedDelegate = EventUtils.bind(self, self.handleResizeStarted);
        this.resizingDelegate = EventUtils.bind(self, self.handleResizing);
        this.resizeEndedDelegate = EventUtils.bind(self, self.handleResizeEnded);

        //Events
        this.geb.addEventListener('resizeStarted', this.resizeStartedDelegate);
        this.geb.addEventListener('resizing', this.resizingDelegate);
        this.geb.addEventListener('resizeEnded', this.resizeEndedDelegate);
        this.geb.addEventListener('soundLoaded', this.soundLoadedDelgate);
    }

    handleSoundLoaded($evt) {
        l.debug('Viz Caught Sound Loaded: ', $evt);

        //Save references
        this.audioManager = $evt.data.audioManager;
        this.audioSource = $evt.data.audioSource;
        this.audioContext = $evt.data.audioContext;

        this.totalSamples = this.audioSource.buffer.length;
        this.lBuffer = this.audioSource.buffer.getChannelData(0);
        this.rBuffer = this.audioSource.buffer.getChannelData(1);

        //set initial start/end markers
        this.markerDO.startMarkerSample = 0;
        this.markerDO.endMarkerSample = this.totalSamples-1;
        l.debug('lBuffer Length: ', this.lBuffer.length);
        l.debug('rBuffer Length: ', this.rBuffer.length);
        l.debug('Num Samples Per Line: ', this.samplesPerLine);
        l.debug('StartMarker Sample: ', this.markerDO.startMarkerSample);
        l.debug('EndMarker Sample: ', this.markerDO.endMarkerSample);
        this.layoutVis();

        //Start Animation
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);

    }

    handleResizeStarted($evt) {
        l.debug('VizManager caught resize started');
        cancelAnimationFrame(this.rafId);
        this.isResizing = true;
    }

    handleResizing($evt) {
        this.layoutVis();
    }

    handleResizeEnded($evt) {
        l.debug('VizManager caught resize ended');
        this.isResizing = false;
        this.layoutVis();
        this.rafId = requestAnimationFrame(this.requestAnimationFrameDelegate);
    }

    layoutVis() {

        if(!this.isResizing) {
            //Clear canvas
            this.waveCanvasContext.fillStyle = '#070125';
            this.waveCanvasContext.fillRect(0, 0, this.waveCanvas.width,this.waveCanvas.height);
            this.cleanWaveCanvasContext.clearRect(0, 0, this.cleanWaveCanvas.width, this.cleanWaveCanvas.height);

            //Handle horizon
            this.horizon = Math.round(this.waveCanvas.height/2);
            /*
            this.markerDO.loopRect.height = this.horizon - Math.round(this.horizon / 2);
            this.markerDO.loopRect.y = this.horizon + Math.round(this.horizon / 2);
            */
            this.markerDO.loopRect.height = this.waveCanvas.height;
            this.markerDO.loopRect.y = 0;

            //Determine how many samples to average to generate the line
            this.samplesPerLine = Math.floor(this.totalSamples / this.waveCanvas.width);
            this.markerDO.samplesPerPixel = this.samplesPerLine;

            //Set color for line drawing
            //this.waveCanvasContext.fillStyle = '#4A0BA8';
            this.waveCanvasContext.fillStyle = '#ffffff';
            this.cleanWaveCanvasContext.fillStyle = '#AAAAAA';

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
                    total += this.lBuffer[(i*this.samplesPerLine)+j];
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
                    y = this.horizon - sampleHeights[x];
                } else {
                    y = this.horizon;
                }

                let height = sampleHeights[x] * heightScaleFactor * 2;
                this.waveCanvasContext.fillRect(x-2, y, 5, height);
                this.cleanWaveCanvasContext.fillRect(x, y, 1, height);
            }

            this.geb.dispatchEvent(new JacEvent('vizLayoutChanged'));
        } else {
            let gradient = this.waveCanvasContext.createLinearGradient(0,0,0,this.waveCanvas.height);
            gradient.addColorStop(0.0, '#330b67');
            gradient.addColorStop(0.5, '#89217f');
            gradient.addColorStop(1.0, '#330b67');

            this.waveCanvasContext.fillStyle = gradient;
            this.waveCanvasContext.fillRect(0,0,this.waveCanvas.width,this.waveCanvas.height);
        }


    }

    handleRequestAnimationFrame($evt) {
        this.stats.begin();

        //Clear Canvas
        this.clearSoundCanvas();

        //Draw Loop rect
        //this.soundCanvasContext.fillStyle = '#d6d124';
        //this.soundCanvasContext.fillStyle = 'rgba(74,11,168,0.5)';
        this.soundCanvasContext.fillStyle = 'rgba(16,10,255,0.3)';
        this.soundCanvasContext.fillRect(
            this.markerDO.loopRect.x,
            this.markerDO.loopRect.y,
            this.markerDO.loopRect.width,
            this.markerDO.loopRect.height
        );

        //Draw Start Marker
        //this.soundCanvasContext.fillStyle = '#FF9A00';
        this.soundCanvasContext.fillStyle = '#ffffff';
        let startMarkerX = Math.floor(this.markerDO.startMarkerSample / this.samplesPerLine);
        //l.debug('StartMarkerX: ', startMarkerX , '/', this.markerDO.startMarkerSample, this.samplesPerLine);
        this.soundCanvasContext.fillRect(startMarkerX-2, 0, 4, this.soundCanvas.height);

        //Draw End Marker
        //this.soundCanvasContext.fillStyle = '#C82920';
        this.soundCanvasContext.fillStyle = '#ffffff';
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