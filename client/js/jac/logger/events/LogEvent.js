/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 */

import JacEvent from 'jac/events/JacEvent';

export default class LogEvent extends JacEvent {
    /**
     * Creates a LogEvent object
     * @param {String} $type
     * @extends {JacEvent}
     * @constructor
     */
    constructor($type){
        //super
       super($type);
    }
}
/** @const */
LogEvent.TARGET_UPDATED = 'logTargetUpdatedEvent';


