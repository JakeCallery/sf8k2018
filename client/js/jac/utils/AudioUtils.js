/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

export default {
	getContext: () => {
		let audioContext = null;

		try {
            window.audioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
		} catch ($err) {
			throw new Error('Web Audio API is not supported in this browser');
		}

		return audioContext;
	},

	createSoundSource: ($audioContext, $audioData, $makeMono) => {
		let soundSource = $audioContext.createBufferSource();
		soundSource.buffer = $audioContext.createBuffer($audioData, $makeMono);
		return soundSource;
	},

	createSoundSourceWithBuffer: ($audioContext, $buffer) => {
		let soundSource = $audioContext.createBufferSource();
		soundSource.buffer = $buffer;
		return soundSource;
	}


};
