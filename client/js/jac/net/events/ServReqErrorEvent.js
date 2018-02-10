/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */
import JacEvent from 'jac/events/JacEvent';
import ObjUtils from 'jac/utils/ObjUtils';
	export default (function(){

		/**
		 * Creates a ServReqErrorEvent object
		 * @param {String} $type
		 * @param {Object} $errorEvent
		 * @param {XMLHttpRequest} $request
		 * @extends {JacEvent}
		 * @constructor
		 */
		function ServReqErrorEvent($type, $errorEvent, $request){
			//super
			JacEvent.call(this, $type);

			/** @type {XMLHttpRequest} */
			this.request = $request;
			/** @type {Object} */
			this.errorEvent = $errorEvent;
		}

		//inherit / extend
		ObjUtils.inheritPrototype(ServReqErrorEvent, JacEvent);

		/** @const */
		ServReqErrorEvent.ERROR = 'servReqErrorEvent';

		//Return constructor
		return ServReqErrorEvent;
	})();
