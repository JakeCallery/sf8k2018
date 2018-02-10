/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import JacEvent from 'jac/events/JacEvent';
import ObjUtils from 'jac/utils/ObjUtils';
    export default (function(){

	    SequenceEvent.LOOP_COMPLETE = 'SequenceEvent.LOOP_COMPLETE';
	    SequenceEvent.STOPPED = 'SequenceEvent.STOPPED';
	    SequenceEvent.COMPLETE = 'SequenceEvent.COMPLETE';


	    /**
         * Creates a SequenceEvent object
         * @extends {JacEvent}
         * @constructor
         */
        function SequenceEvent($type,$data){
            //super
            JacEvent.call(this,$type,$data);
        }
        
        //Inherit / Extend
        ObjUtils.inheritPrototype(SequenceEvent,JacEvent);
        
        //Return constructor
        return SequenceEvent;
    })();

