/**
 * Created with JetBrains PhpStorm.
 * User: Jake
 * Date: 4/16/13
 * Time: 3:23 PM
 * To change this template use File | Settings | File Templates.
 */

export default class JacEvent {

    /**
     * Creates a JacEvent object to be used with jac.EventDispatcher
     * @param {String} $type
     * @param {Object} [$data]
     * @constructor
     */
    constructor ($type, $data) {
        this.target = undefined;
        this.currentTarget = undefined;
        this.type = $type;
        this.data = $data;
    }
}

