/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){
        var PlayDirection = {};

	    PlayDirection.BACKWARD = -1;
	    PlayDirection.STOPPED = 0;
	    PlayDirection.FORWARD = 1;

        //Return constructor
        return PlayDirection;
    })();

