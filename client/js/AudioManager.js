import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';
import AudioUtils from 'jac/utils/AudioUtils';
import MarkerDataObject from 'MarkerDataObject';

export default class AudioManager extends EventDispatcher {
    constructor($window) {
        super();

        let self = this;
        this.window = $window;
        this.geb = new GlobalEventBus();

        this.audioContext = null;
        this.audioSource = null;

        this.currentTime = 0;
        this.hasPlayedOnce = false;

        this.scriptProcessorNode = null;
        this.gainNode = null;
        this.panNode = null;

        this.totalSamples = null;
        this.startSampleIndex = null;
        this.endSampleIndex = null;
        this.currentSampleIndex = null;

        this.sourceLChannelData = null;
        this.sourceRChannelData = null;

        this.isPlaying = false;

        this.markerDO = new MarkerDataObject();

        //Delegates
        this.requestPlayDelegate = EventUtils.bind(self, self.handleRequestPlay);
        this.requestPlayToggleDelegate = EventUtils.bind(self, self.handleRequestPlayToggle);
        this.requestPauseDelegate = EventUtils.bind(self, self.handleRequestPause);
        this.audioProcessDelegate = EventUtils.bind(self, self.handleAudioProcess);
        this.volChangeDelegate = EventUtils.bind(self, self.handleVolChange);
        this.panChangeDelegate = EventUtils.bind(self, self.handlePanChange);
        this.forceUpdateCurrentSampleIndexDelegate = EventUtils.bind(self, self.handleForceUpdateCurrentSampleIndex);

        //Events
        this.geb.addEventListener('requestPlay', this.requestPlayDelegate);
        this.geb.addEventListener('requestPlayToggle', this.requestPlayToggleDelegate);
        this.geb.addEventListener('requestPause', this.requestPauseDelegate);
        this.geb.addEventListener('volChange', this.volChangeDelegate);
        this.geb.addEventListener('panChange', this.panChangeDelegate);
        this.geb.addEventListener('setInitialVol', this.volChangeDelegate);
        this.geb.addEventListener('forceUpdateCurrentSampleIndex', this.forceUpdateCurrentSampleIndexDelegate);

    }

    init() {
        return new Promise((resolve, reject) => {
            //Set up context
            try {
                this.audioContext = AudioUtils.getContext();

                this.scriptProcessorNode = this.audioContext.createScriptProcessor(2048,0,2);
                this.scriptProcessorNode.addEventListener('audioprocess', this.audioProcessDelegate);

                this.gainNode = this.audioContext.createGain();
                this.panNode = this.audioContext.createStereoPanner();

                //set initial volume as muted
                this.gainNode.gain.setTargetAtTime(0.0, this.audioContext.currentTime, 0)

            } catch($err) {
                l.error('Failed to create audio context: ', $err);
                reject($err);
            }

            //Set up source
            try {
                this.audioSource = AudioUtils.createSoundSourceWithBuffer(this.audioContext);
                if(!this.audioSource.start){
                    l.warn('Source.start note defined, using noteOn');
                    this.audioSource.start = this.audioSource.noteOn;
                }
            } catch ($err) {
                l.error('Failed to create audio source: ', $err);
                reject($err);
            }

            //Continue
            resolve();
        });

    }

    handleMomentaryMute($evt) {
        l.debug('Caught Momentary Mute');
        this.gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0);
    }

    handleUnmute($evt) {
        l.debug('Caught Unmute: ', $evt.data);
        let vol = ($evt.data / 100);
        this.gainNode.gain.setTargetAtTime(vol, this.audioContext.currentTime, 0);
    }

    loadSound($url) {
        return new Promise((resolve, reject) => {
           return fetch($url, {
                method: 'GET',
                headers: new Headers({
                })
            })
            .then(($response) => {
                l.debug('Recieved Array Buffer');
                return $response.arrayBuffer();
            })
            .then(($buffer) => {
                l.debug('Starting audio decode');
                return new Promise((resolve, reject) => {
                    this.audioContext.decodeAudioData($buffer, ($decodedData) => {
                        this.audioSource.buffer = $decodedData;
                        this.sourceLChannelData = this.audioSource.buffer.getChannelData(0);
                        this.sourceRChannelData = this.audioSource.buffer.getChannelData(1);
                        this.audioSource.loop = true;
                        this.audioSource.connect(this.scriptProcessorNode);
                        this.scriptProcessorNode.connect(this.panNode);
                        this.panNode.connect(this.gainNode);
                        this.gainNode.connect(this.audioContext.destination);
                        this.startSampleIndex = 0;
                        this.currentSampleIndex = 0;
                        this.endSampleIndex = this.audioSource.buffer.length - 1;
                        this.totalSamples = this.audioSource.buffer.length;

                        l.debug('Sound finished decoding');
                        l.debug('Samples Per Second: ', this.audioContext.sampleRate);
                        l.debug('Num Channels: ', this.audioSource.buffer.numberOfChannels);
                        l.debug('Num Samples: ', this.audioSource.buffer.length);
                        l.debug('Duration: ', this.audioSource.buffer.duration);

                        this.geb.dispatchEvent(new JacEvent('soundLoaded',
                            {
                                audioManager:this,
                                audioSource:this.audioSource,
                                audioContext:this.audioContext
                            })
                        );
                        resolve();
                    });
                });
            })
            .then(() => {
                l.debug('After Sound Finished Decoding');
                this.geb.dispatchEvent(new JacEvent('requestInitialVol'));
                resolve();
            })
            .catch(($error) => {
                l.error('Load Sound Error: ', $error);
            })
        });
    }

    handleForceUpdateCurrentSampleIndex($evt) {
        l.debug('Caught Force Sample Index Update: ', $evt.data);
        this.currentSampleIndex = $evt.data;
    }

    handleRequestPlayToggle($evt) {
        l.debug('Toggle Play/Pause');
        this.isPlaying = !this.isPlaying;
        this.geb.dispatchEvent(new JacEvent('playStateChanged', this.isPlaying));
    }

    handleRequestPlay($evt) {
        l.debug('Caught Play Request');
        if(this.isPlaying === false) {
            this.isPlaying = true;
        }
    }

    handleRequestPause($evt) {
        l.debug('Caught Pause Request');
        if(this.isPlaying === true) {
            this.isPlaying = false;
        }
    }

    handleVolChange($evt) {
        let vol = ($evt.data / 100);
        l.debug('caught vol change: ', vol);
        this.gainNode.gain.setTargetAtTime(vol, this.audioContext.currentTime, 0)
    }

    handlePanChange($evt) {
        let pan = ($evt.data / 100);
        l.debug('Pan change: ', pan);
        this.panNode.pan.value = pan;
    }

    handleAudioProcess($evt){
        let outputBuffer = $evt.outputBuffer;
        let lOutputBuffer = outputBuffer.getChannelData(0);
        let rOutputBuffer = outputBuffer.getChannelData(1);

        if(this.isPlaying) {
            for(let i = 0; i < lOutputBuffer.length; i++){
                //Update sample range on each sample index in case we changed presets
                this.startSampleIndex = this.markerDO.startMarkerSample;
                this.endSampleIndex = this.markerDO.endMarkerSample;

                //Update direction with each iteration
                let direction = (this.endSampleIndex >= this.startSampleIndex)?1:-1;
                this.currentSampleIndex += direction;

                if(direction === 1){
                    if(this.currentSampleIndex > this.endSampleIndex || this.currentSampleIndex > this.totalSamples){
                        //Went off end, notify presets
                        this.geb.dispatchEvent(new JacEvent('exceedingPreset'));
                        this.startSampleIndex = this.markerDO.startMarkerSample;
                        this.endSampleIndex = this.markerDO.endMarkerSample;
                        this.currentSampleIndex = this.startSampleIndex;
                    } else if(this.currentSampleIndex < this.startSampleIndex){
                        this.currentSampleIndex = this.startSampleIndex;
                    }
                } else if(direction === -1) {
                    if(this.currentSampleIndex < this.endSampleIndex || this.currentSampleIndex <= 0){
                        //Went off end, notify presets
                        this.geb.dispatchEvent(new JacEvent('exceedingPreset'));
                        this.startSampleIndex = this.markerDO.startMarkerSample;
                        this.endSampleIndex = this.markerDO.endMarkerSample;
                        this.currentSampleIndex = this.startSampleIndex;
                    } else if(this.currentSampleIndex > this.startSampleIndex){
                        this.currentSampleIndex = this.startSampleIndex;
                    }
                }

                lOutputBuffer[i] = this.sourceLChannelData[this.currentSampleIndex];
                rOutputBuffer[i] = this.sourceRChannelData[this.currentSampleIndex];

            }
        } else {
            for(let i = 0; i < lOutputBuffer.length; i++) {
                lOutputBuffer[i] = 0.0;
                rOutputBuffer[i] = 0.0;
            }
        }

    }
}