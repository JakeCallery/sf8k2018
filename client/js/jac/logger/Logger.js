/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import BaseTarget from 'jac/logger/BaseTarget';
import LogLevel from 'jac/logger/LogLevel';
import VerboseLevel from 'jac/logger/VerboseLevel';
import ParsedStackTrace from 'jac/logger/ParsedStackTrace';
export default (function(){

	let Logger = {};
	Logger.isEnabled = true;
	Logger.isTagFilterEnabled = false;
	Logger.isShowingUnTagged = true;
	Logger.isStringFilterEnabled = false;
	Logger.isStringFilterCaseSensitive = true;

	/** {Array.<BaseTarget> */ Logger.targetList = [];
	/** {Array.<String> */ Logger.tagList = [];
	/** {Array.<String> */ Logger.stringFilterList = [];
	Logger.levelFilter = (LogLevel.DEBUG | LogLevel.INFO | LogLevel.WARNING | LogLevel.ERROR);
	Logger.verboseFilter = (VerboseLevel.NORMAL);
	Logger.baseTime = new Date().getTime();

	/**
	 * Log out using the "INFO" level
	 * @param {...} $args variadic args to log
	 */
	Logger.log = function($args){
		Logger.output.call(this, LogLevel.INFO, Array.prototype.slice.call(arguments,0));
	};

	/**
	 * Log out using the "DEBUG" level
	 * @param {...} $args variadic args to log
	 */
	Logger.debug = function($args){
		Logger.output.call(this, LogLevel.DEBUG, Array.prototype.slice.call(arguments,0));
	};

	/**
	 * Log out using the "WARNING" level
	 * @param {...} $args variadic args to log
	 */
	Logger.warn = function($args){
		Logger.output.call(this, LogLevel.WARNING, Array.prototype.slice.call(arguments,0));
	};

	/**
	 * Log out using the "ERROR" level.
	 * It is worth noting that the (optional) exception will be thrown regardless of the verbose level and log level filters.
	 * @param {...} $args variadic args to log.  If the last parameter is 'true' (boolean, not string) an exception will be thrown
	 */
	Logger.error = function($args){
		let args = Array.prototype.slice.call(arguments,0);
		if(args[args.length-1] === true){
			//Throw error
			args.pop();
			Logger.output.call(this, LogLevel.ERROR, Array.prototype.slice.call(args,0));
			throw new Error(args);
		} else {
			Logger.output.call(this, LogLevel.ERROR, Array.prototype.slice.call(args,0));
		}
	};

	/**
	 * Log out using the "TRACKING" level
	 * @param {...} $args variadic args to log
	 */
	Logger.track = function($args){
		Logger.output.call(this, LogLevel.TRACKING, Array.prototype.slice.call(arguments,0));
	};


	/**
	 * send some stuff out to output of each added target
	 * @param {int} $logLevel
	 * @param {Array.<String>} $args list of items to output
	 * @private
	 */
	Logger.output = function($logLevel, $args){
		if(Logger.isEnabled){

			//Grab tag if it exists
			let tag = '';
			let lastArg = $args[$args.length-1];
			if(typeof lastArg === 'string' && lastArg.charAt(0) === '@'){
				tag = $args.pop();
			}

			//Loop through targets, and output if needed
			for(let i = 0; i < Logger.targetList.length; i++){
				let output = '';
				let outputArray = [];

				//Copy args to new array we can screw with
				for(let c = 0; c < $args.length; c++){
					outputArray.push($args[c]);
				}

				let target = Logger.targetList[i];
				if(target.isEnabled && ($logLevel & Logger.levelFilter)){
					//filter on tags
					if(Logger.isShowingUnTagged && tag === '' || Logger.tagList.indexOf(tag) != -1 ||
						Logger.tagList.length === 0 || $logLevel & LogLevel.WARNING ||
						Logger.isTagFilterEnabled !== true){

						if(Logger.verboseFilter & VerboseLevel.LEVEL){
							//Add level to output
							output += ('[' + LogLevel.getName($logLevel));
							if(tag !== ''){
								output += ':' + tag;
							}
							output += ']';
						}

						if(Logger.verboseFilter !== 0){
							//Use full stack trace
							output += Logger.buildOutput() + ' ';
						}

						if(Logger.isStringFilterEnabled && Logger.stringFilterList.length > 0 && !(LogLevel & LogLevel.WARNING)){
							let str = output;
							let pattern = '';
							let re = null;

							for(let s = 0; s < Logger.stringFilterList.length; s++){
								pattern = Logger.stringFilterList[s];

								if(Logger.isStringFilterCaseSensitive === true){
									re = new RegExp(pattern);
								} else {
									re = new RegExp(pattern, 'i');
								}

								if(str.search(re) !== -1){
									outputArray.unshift(output);
									target.output.apply(target, outputArray);
									break;
								}

							}

						} else {
							//final output
							outputArray.unshift(output);
							target.output.apply(target, outputArray);
						}
					}
				}
			}
		}
	};

	/**
	 * Parses a stacktrace into useable parts for the logger
	 * @param {ParsedStackTrace} [$pst]
	 * @returns {String}
	 */
	Logger.buildOutput = function($pst){
		let result = '';
		let pst = $pst;
		if($pst == undefined){
			pst = new ParsedStackTrace(Logger.createException());
		}

		if(pst.hasStackTrace){
			//Good stack to work with

			//Handle TIME
			if(this.verboseFilter & VerboseLevel.TIME){
				let timeDiff = new Date().getTime() - Logger.baseTime;
				let milli = (timeDiff % 1000).toString();
				let seconds = (Math.floor(timeDiff / 1000) % 60).toString();
				let minutes = Math.floor(timeDiff / 60000).toString();

				if(milli.length < 2){
					milli = '00' + milli;
				} else if(milli.length < 3){
					milli = '0' + milli;
				}

				if(seconds.length < 2){
					seconds = '0' + seconds;
				}

				result += ('[' + minutes + ':' + seconds + ':' + milli + ']');

			}

			result += '[';

			//Handle FilePath
			if(this.verboseFilter & VerboseLevel.FILEPATH){
				result += pst.filePath + '/';
			}

			if(this.verboseFilter & VerboseLevel.FILE){
				result += pst.fileName;
			}

			if(this.verboseFilter & VerboseLevel.FUNCTION){
				if(result[result.length-1] !== '['){
					result += '::';
				}
				result += pst.functionName;
			}

			if(this.verboseFilter & VerboseLevel.LINE){
				result += ':' + pst.lineNumber;
			}

			result += ']';


		} else {
			result = '[NO STACK TRACE]';
		}


		return result;
	};

	/**
	 * Returns an error object to use for stack trace parsing
	 * @returns {Error | null}
	 */
	Logger.createException = function(){
		try{
		  this.undef();
		}  catch(err){
		  return err;
		}

		return null;
	};

	/**
	 * Add a log target to the logging system
	 * @param {BaseTarget} $target
	 * @param {Boolean} [$allowDuplicate = false]
	 * @returns {BaseTarget}
	 */
	Logger.addLogTarget = function($target, $allowDuplicate){
		if(typeof $allowDuplicate === 'undefined'){$allowDuplicate = false;}

		let $allowAdd = true;

		if(!$allowDuplicate){
			for(let i = 0; i < Logger.targetList.length; i++){
				if($target.constructor == Logger.targetList[i].constructor){
					//found a duplicate
					$allowAdd = false;
					break;
				}
			}
		}

		if($allowAdd === true){
			Logger.targetList.push($target);
		}
		return $target;
	};

	/**
	 * Adds a string filter to the list
	 * @param {String} $stringFilter
	 * @returns {boolean} true if success
	 */
	Logger.addStringFilter = function($stringFilter){
		let success = false;
		let isDuplicate = false;

		for(let i = 0; i < Logger.stringFilterList.length; i++){
			if(Logger.stringFilterList[i] == $stringFilter){
				//found a duplicate
				isDuplicate = true;
				success = false;
				break;
			}
		}

		if(isDuplicate === false){
			//not a duplicate, move along
			Logger.stringFilterList.push($stringFilter);
			success = true;
		}
		return success;
	};

	/**
	 * Removes a string filter from the list
	 * @param {String} $stringFilter
	 * @returns {boolean} true if success
	 */
	Logger.removeStringFilter = function($stringFilter){
		let success = false;

		for(let i = 0; i < Logger.stringFilterList.length; i++){
			//Look for tag in the list
			if(Logger.stringFilterList[i] == $stringFilter){
				Logger.stringFilterList.splice(i,1);
				success = true;
				break;
			}
		}

		return success;
	};

	/**
	 * Adds a tag to filter by to the list
	 * @param {String} $tag All tags MUST start with '@'
	 * @returns {boolean} true if added, false if not. A duplicate is not considered success
	 */
	Logger.addTag = function($tag){
		let success = false;
		let isDuplicate = false;

		for(let i = 0; i < Logger.tagList.length; i++){
			if(Logger.tagList[i] == $tag){
				//found a duplicate
				isDuplicate = true;
				success = false;
				break;
			}
		}

		if(isDuplicate === false){
			//not a duplicate, move along
			if($tag.charAt(0) === '@'){
				//good tag
				Logger.tagList.push($tag);
			} else {
				//bad tag
				success = false;
				throw Error('Logger::addTag: Tag must start with \'@\'');
			}
		}

		return success;
	};

	/**
	 * Removes a tag from the tag filter list
	 * @param {String} $tag
	 * @returns {boolean} true if removed, false otherwise
	 */
	Logger.removeTag = function($tag){
		let success = false;

		for(let i = 0; i < Logger.tagList.length; i++){
			//Look for tag in the list
			if(Logger.tagList[i] == $tag){
				Logger.tagList.splice(i,1);
				success = true;
				break;
			}
		}

		return success;
	};

	//Return constructor
	return Logger;
})();

