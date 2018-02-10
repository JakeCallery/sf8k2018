/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

define([],
function(){
    return (function(){
        var AudioUtils ={};

	    AudioUtils.getContext = function(){
		    var context = null;

		    if(typeof AudioContext !== 'undefined'){
				context = new AudioContext();
		    } else if(typeof webkitAudioContext !== 'undefined'){
				context = new webkitAudioContext();
		    } else {
			    context = null;
		    }

		    return context;
	    };

	    AudioUtils.createSoundSource = function($audioContext, $audioData, $makeMono){
		    var soundSource = $audioContext.createBufferSource();
		    soundSource.buffer = $audioContext.createBuffer($audioData, $makeMono);
			return soundSource;
	    };

	    AudioUtils.createSoundSourceWithBuffer = function($audioContext, $buffer){
		    var soundSource = $audioContext.createBufferSource();
		    soundSource.buffer = $buffer;
		    return soundSource;
	    };

        //Return constructor
        return AudioUtils;
    })();
});
