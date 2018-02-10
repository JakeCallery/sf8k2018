/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import BaseTarget from 'jac/logger/BaseTarget';
import LogEvent from 'jac/logger/events/LogEvent';

export default class ConsoleTarget extends BaseTarget{
	/**
	 * Creates a ConsoleTarget object
	 * @extends {BaseTarget}
	 * @constructor
	 */
	constructor(){

		//super
		super();

		//Private
		let _hasConsoleLog = (('console' in window) && ('log' in window.console));

		//Privileged Methods
		this.getHasConsoleLog = function(){
			return _hasConsoleLog;
		};
	}

	/**
	 * Prints args to the browser console.  Dispatchers LogEvent.TARGET_UPDATED when done
	 * @param {...} $args variadic args
	 * @override
	 */
	output($args){
		if(this.isEnabled){
			super.output(arguments);

			if(this.getHasConsoleLog()){
				let list = Array.prototype.slice.call(arguments,0);
				console.log.apply(console, list);
				this.dispatchEvent(new LogEvent(LogEvent.TARGET_UPDATED));
			}
		}
	};
}

