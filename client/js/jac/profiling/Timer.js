/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import TimeObject from 'jac/profiling/TimeObject';
    export default (function(){
       var Timer = {};

	    Timer._times = {};

	    Timer.startTime = function($id, $forcedTime){
	        if($id === undefined){
		        $id = 'noid';
	        }

	        if($forcedTime === undefined){
		        $forcedTime = Date.now();
	        }

		    Timer._times[$id] = new TimeObject($id,$forcedTime);

        };

	    Timer.startNewBlock = function($id, $forcedTime){
		    if($id === undefined){$id = 'noid';}
		    if($forcedTime === undefined){$forcedTime = Date.now();}

		    if(Timer._times.hasOwnProperty($id)){
			    var obj = Timer._times[$id];
			    obj.update($forcedTime, false);
			    obj.isEnded = false;
		    } else {
			    //bad id, make new timer
			    Timer._times[$id] = new TimeObject($id,$forcedTime);
		    }

	    };

	    Timer.endTime = function($id, $forcedTime){
	        if($id === undefined){$id = 'noid';}
	        if($forcedTime === undefined){$forcedTime = Date.now();}

	        var diff = NaN;

	        if(Timer._times.hasOwnProperty($id)){
				var obj = Timer._times[$id];
		        diff = obj.update($forcedTime, true);
		        obj.isEnded = true;
	        } else {
		        //bad id
		        throw new Error('EndTime Bad Timer ID: ' + $id);
	        }

	        return diff;
        };

	    Timer.addTime = function($id, $forcedTime){
	        if($id === undefined){$id = 'noid';}
	        if($forcedTime === undefined){$forcedTime = Date.now();}

	        var diff = NaN;

	        if(Timer._times.hasOwnProperty($id)){
		        var obj = Timer._times[$id];
		        diff = obj.update($forcedTime, !(obj.isEnded));
	        } else {
		        //bad id
		        throw new Error('AddTime Bad Timer ID: ' + $id);
	        }

	        return diff;

        };

	    Timer.getTotal = function($id){
			if(Timer._times.hasOwnProperty($id)){
				return Timer._times[$id].total;
			} else {
				return NaN;
			}
        };

	    Timer.getAverage = function($id){
		    if(Timer._times.hasOwnProperty($id)){
			    return Timer._times[$id].getAverage();
		    } else {
			    return NaN;
		    }
	    };

	    Timer.getCount = function($id){
		    if(Timer._times.hasOwnProperty($id)){
			    return Timer._times[$id].count;
		    } else {
			    return NaN;
		    }
	    };

	    Timer.clear = function($id){
			if($id === ''){
				//clear all
				for(var item in Timer._times){
					if(Timer._times.hasOwnProperty(item)){
						//remove
						delete(Timer._times[item]);
					}
				}
			} else {
				//clear one
				if(Timer._times.hasOwnProperty($id)){
					delete(Timer._times[$id]);
				}
			}
        };

        //Return constructor
        return Timer;
    })();

