import l from 'jac/logger/Logger';
import EventUtils from 'jac/utils/EventUtils';
import EventDispatcher from 'jac/events/EventDispatcher';
import GlobalEventBus from 'jac/events/GlobalEventBus';
import JacEvent from './jac/events/JacEvent';
import AudioUtils from 'jac/utils/AudioUtils';

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

        this.scriptProcessor = null;

        //Delegates
        this.requestPlayDelegate = EventUtils.bind(self, self.handleRequestPlay);
        this.requestPauseDelegate = EventUtils.bind(self, self.handleRequestPause);
        this.audioProcessDelegate = EventUtils.bind(self, self.handleAudioProcess);

        //Events
        this.geb.addEventListener('requestPlay', this.requestPlayDelegate);
        this.geb.addEventListener('requestPause', this.requestPauseDelegate);

    }

    init() {
        return new Promise((resolve, reject) => {
            //Set up context
            try {
                this.audioContext = AudioUtils.getContext();
                this.scriptProcessor = this.audioContext.createScriptProcessor(4096,1,1);
                this.scriptProcessor.addEventListener('audioprocess', this.audioProcessDelegate);
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
                        this.audioSource.connect(this.scriptProcessor);
                        this.scriptProcessor.connect(this.audioContext.destination);
                        l.debug('Sound finished decoding');
                        l.debug('Num Channels: ', this.audioSource.buffer.numberOfChannels);
                        l.debug('Num Samples: ', this.audioSource.buffer.length);
                        resolve();
                    });
                });
            })
            .then(() => {
                l.debug('After Sound Finished Decoding');

                resolve();
            })
            .catch(($error) => {
                l.error('Load Sound Error: ', $error);
            })
        });
    }

    handleRequestPlay($evt) {
        l.debug('Caught Play Request');
        l.debug('CurrentState: ', this.audioContext.state);
        if(this.audioContext.state === 'suspended'){
            l.debug('Resuming');
            this.audioContext.resume()
                .then(() => {
                   l.debug('Resumed');
                })
                .catch(($err) => {
                   l.error('Resume Error: ', $err);
                });
        } else if(this.hasPlayedOnce === false) {
            l.debug('Playing First Time');
            this.audioSource.start(this.currentTime);
            this.hasPlayedOnce = true;
        } else {
            l.warn('audiocontext not in a paused state, so will not try playing');
        }

    }

    handleRequestPause($evt) {
        l.debug('Caught Pause Request: ', this.audioContext.state);
        this.currentTime = this.audioContext.currentTime;
        if(this.audioContext.state === 'running' && this.hasPlayedOnce === true){
            this.audioContext.suspend()
                .then(() => {
                    l.debug('Audio Context Suspended');
                })
                .catch(($err) => {
                    l.error('Pause Error: ', $error);
                });
        } else {
            l.warn('AudioContextState is not running or has not been played onces ', this.audioContext.state, this.hasPlayedOnce);
        }
    }

    handleAudioProcess($evt){
        let inputBuffer = $evt.inputBuffer;
        let outputBuffer = $evt.outputBuffer;

        for(let channel = 0; channel < outputBuffer.numberOfChannels; channel++){
            let inputData = inputBuffer.getChannelData(channel);
            let outputData = outputBuffer.getChannelData(channel);

            //Loop through each sample (in 4096 blocks)
            for(let sample = 0; sample < inputBuffer.length; sample++){
                outputData[sample] = inputData[sample];
            }
        }
    }
}