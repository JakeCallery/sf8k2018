/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import EventDispatcher from 'jac/events/EventDispatcher';
import ObjUtils from 'jac/utils/ObjUtils';
import LoopStyle from 'jac/sprite/LoopStyle';
import EventUtils from 'jac/utils/EventUtils';
import L from 'jac/logger/Logger';
import SequenceEvent from 'jac/sprite/events/SequenceEvent';
    export default (function(){
        /**
         * Creates a SequenceManager object
         * @extends {EventDispatcher}
         * @constructor
         */
        function SequenceManager(){
            //super
            EventDispatcher.call(this);

	        this.queue = [];
	        var self = this;
	        this.completeDelegate = EventUtils.bind(self, self.handleSequenceComplete);
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(SequenceManager,EventDispatcher);

	    SequenceManager.prototype.updateCurrent = function($tickDelta){
		    if(this.queue.length > 0){
			    this.queue[0].update($tickDelta);
		    }
	    };

	    SequenceManager.prototype.handleSequenceComplete = function($e){
		    //L.log('Caught Sequence Complete: ' + $e.data.id, '@sequence');
			this.nextSequence();
	    };

	    SequenceManager.prototype.getCurrentSequence = function(){
		    if(this.queue.length > 0){
			    return this.queue[0];
		    } else {
			    return null;
		    }
	    };

	    SequenceManager.prototype.getSequenceById = function($id){
		    for(var i = 0, l = this.queue.length; i < l; i++){
			    if(this.queue[i].id === $id){
				    return this.queue[i];
			    }
		    }

		    return null;
	    };

	    SequenceManager.prototype.enqueue = function($sequence){
			this.queue.push($sequence);
	    };

	    SequenceManager.prototype.dequeueCurrent = function(){
		    if(this.queue.length > 0){
			    this.cleanSequence(this.queue[0]);
			    this.queue.shift();
		    }
	    };

	    SequenceManager.prototype.dequeueAllButCurrent = function(){
		    for(var i = this.queue.length-1; i >= 1; i--){
		        this.cleanSequence(this.queue[i]);
			    this.queue.splice(i,1);
		    }
	    };

	    SequenceManager.prototype.dequeueFirstOf = function($sequence){
			for(var i = 0, l = this.queue.length; i < l; i++){
				if(this.queue[i] === $sequence){
					this.cleanSequence($sequence);
					this.queue.splice(i,1);
					break;
				}
			}
	    };

	    SequenceManager.prototype.dequeueAll = function($sequence){
			var found = false;
		    for(var i = this.queue.length-1; i >= 0; i--){
				if(this.queue[i] === $sequence){
					if(!found){this.cleanSequence($sequence);}
					this.queue.splice(i,1);
					found = true;
				}
			}
	    };

	    SequenceManager.prototype.cleanSequence = function($sequence){
			$sequence.removeAllHandlers();
	    };

	    SequenceManager.prototype.clear = function(){
			for(var i = this.queue.length-1; i >= 0; i--){
				this.cleanSequence(this.queue[i]);
			}

		    this.queue = [];
	    };

	    SequenceManager.prototype.replaceAll = function($sequence){
			this.clear();
		    this.enqueue($sequence);
	    };

	    SequenceManager.prototype.replaceNext = function($sequence){
			this.dequeueAllButCurrent();
		    this.enqueue($sequence);
	    };

	    SequenceManager.prototype.nextSequence = function(){
			this.dequeueCurrent();
	    };

	    SequenceManager.prototype.nextAfterComplete = function(){
			if(this.queue.length > 0){
				this.queue[0].loopStyle = LoopStyle.ONCE;
				this.queue[0].addHandler(SequenceEvent.COMPLETE, this.completeDelegate);
			}
	    };

        //Return constructor
        return SequenceManager;
    })();

