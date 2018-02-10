/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){
        /**
         * Creates a TimeObject object
         * @constructor
         */
        function TimeObject($id, $time){
	        this.time = $time;
	        this.id = $id;
	        this.total = 0;
	        this.count = 0;
	        this.isEnded = false;

			this.update = function($newTime, $updateTotals){
				var diff = null;

				if($updateTotals && !(isNaN(this.time))){
					diff = $newTime - this.time;
					this.total += diff;
					this.count++;
				}

				this.time = $newTime;
				return diff;

			};

	        this.getAverage = function(){
		        return this.total / this.count;
	        };

        }
        
        
        //Return constructor
        return TimeObject;
    })();

