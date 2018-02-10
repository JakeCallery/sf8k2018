/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import EventDispatcher from 'jac/events/EventDispatcher';

export default class BaseTarget extends EventDispatcher{
	/**
	 * Creates a BaseTarget object
	 * @extend {EventDispatcher)
	 * @constructor
	 */
	constructor(){

		//super
		super();

		//public
		this.isEnabled = true;
	}

	/**
	 * File output of items to be logged.  This is mean to be overridden
	 * @param $args {...} varadic args
	 */
	output($args){
	  //OVERRIDE ME
	};
}

