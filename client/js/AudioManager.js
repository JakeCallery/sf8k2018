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

        this.audioContext = null;
        this.audioSource = null;

        //Delegates

        //Events

    }

    init() {
        return new Promise((resolve, reject) => {
            //Set up context
            try {
                this.audioContext = AudioUtils.getContext();
            } catch($err) {
                l.error('Failed to create audio context: ', $err);
                reject($err);
            }

            //Set up source
            try {
                this.audioSource = AudioUtils.createSoundSourceWithBuffer(this.audioContext);
            } catch ($err) {
                l.error('Failed to create audio source: ', $err);
                reject($err);
            }

            resolve();
        });

    }

    loadSound($url) {
        return new Promise((resolve, reject) => {
            fetch($url, {
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
                        this.audioSource.connect(this.audioContext.destination);
                        l.debug('Sound finished decoding');
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
}