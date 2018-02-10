/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


    export default (function(){
       var MathUtils = {};

	    MathUtils.PI_OVER_180 = (Math.PI/180);
	    MathUtils.ONE_EIGHTY_OVER_PI = (180/Math.PI);

	    MathUtils.rgbToHex = function($red, $green, $blue){
			return MathUtils.toHex($red) + MathUtils.toHex($green) + MathUtils.toHex($blue);
	    };

	    MathUtils.toHex = function($num){
		    $num = parseInt($num,10);
		    if (isNaN($num)) return "00";
		    $num = Math.max(0,Math.min($num,255));
		    return "0123456789ABCDEF".charAt(($num-$num%16)/16)
			    + "0123456789ABCDEF".charAt($num%16);
	    };

	    MathUtils.degToRad = function($degrees){
			return $degrees * MathUtils.PI_OVER_180;
	    };

	    MathUtils.radToDeg = function($radians){
			return $radians * MathUtils.ONE_EIGHTY_OVER_PI;
	    };

	    MathUtils.rand = function($minVal, $maxVal){
		    var min;
		    var max;
		    var diff;
		    var tmpVal;

		    if ($minVal > $maxVal)
		    {//swap
			    min = $maxVal;
			    max = $minVal;
		    }//swap
		    else
		    {//default
			    min = $minVal;
			    max = $maxVal;
		    }//default

		    diff = max - min;
		    tmpVal = Math.random() * diff;

		    return min + tmpVal;
	    };

	    MathUtils.clampToRange = function($min, $max, $val){
	        var min,max,val;
		    if($min > $max){
			    max = $min;
			    min = $max
		    } else {
			    min = $min;
			    max = $max;
		    }

		    if($val < $min){
			    val = min;
		    } else if($val > $max){
			    val = max;
		    } else {
			    val = $val;
		    }

		    return val;
	    };

        //Return constructor
        return MathUtils;
    })();

