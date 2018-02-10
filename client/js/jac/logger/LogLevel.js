/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */


export default (function(){
	let LogLevel = {
	};

	/** @const */ LogLevel.DEBUG = 2;
	/** @const */ LogLevel.INFO = 4;
	/** @const */ LogLevel.WARNING = 8;
	/** @const */ LogLevel.ERROR = 16;
	/** @const */ LogLevel.TRACKING = 32;
	/** @const */ LogLevel.ALL = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR | LogLevel.TRACKING);

	LogLevel.getName = function($filter){
		let result = '';

		if($filter & LogLevel.DEBUG){
			if(result != ''){result += ',';}
			result += 'DEBUG';
		}

		if($filter & LogLevel.INFO){
			if(result != ''){result += ',';}
			result += 'INFO';
		}

		if($filter & LogLevel.WARNING){
			if(result != ''){result += ',';}
			result += 'WARNING';
		}

		if($filter & LogLevel.ERROR){
			if(result != ''){result += ',';}
			result += 'ERROR';
		}

		if($filter & LogLevel.TRACKING){
			if(result != ''){result += ',';}
			result += 'TRACKING';
		}

		return result;

	};

	//Return Object
	return LogLevel;
})();

